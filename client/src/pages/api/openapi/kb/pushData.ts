import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, TrainingData, KB } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import { authKb } from '@/service/utils/auth';
import { withNextCors } from '@/service/utils/tools';
import { PgTrainingTableName, TrainingModeEnum } from '@/constants/plugin';
import { startQueue } from '@/service/utils/tools';
import { PgClient } from '@/service/pg';
import { modelToolMap } from '@/utils/plugin';
import { getVectorModel } from '@/service/utils/data';
import { DatasetItemType } from '@/types/plugin';

export type Props = {
  kbId: string;
  data: DatasetItemType[];
  mode: `${TrainingModeEnum}`;
  prompt?: string;
};

export type Response = {
  insertLen: number;
};

const modeMap = {
  [TrainingModeEnum.index]: true,
  [TrainingModeEnum.qa]: true
};

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { kbId, data, mode = TrainingModeEnum.index, prompt } = req.body as Props;

    if (!kbId || !Array.isArray(data)) {
      throw new Error('KbId or data is empty');
    }

    if (modeMap[mode] === undefined) {
      throw new Error('Mode is error');
    }

    if (data.length > 500) {
      throw new Error('Data is too long, max 500');
    }

    await connectToDatabase();

    //Certificate verification
    const { userId } = await authUser({ req });

    jsonRes<Response>(res, {
      data: await pushDataToKb({
        kbId,
        data,
        userId,
        mode,
        prompt
      })
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});

export async function pushDataToKb({
  userId,
  kbId,
  data,
  mode,
  prompt
}: { userId: string } & Props): Promise<Response> {
  const [kb, vectorModel] = await Promise.all([
    authKb({
      userId,
      kbId
    }),
    (async () => {
      if (mode === TrainingModeEnum.index) {
        const vectorModel = (await KB.findById(kbId, 'vectorModel'))?.vectorModel;

        return getVectorModel(vectorModel || global.vectorModels[0].model);
      }
      return global.vectorModels[0];
    })()
  ]);

  const modeMaxToken = {
    [TrainingModeEnum.index]: vectorModel.maxToken,
    [TrainingModeEnum.qa]: global.qaModel.maxToken * 0.8
  };

  // filter duplicate qa content
  const set = new Set();
  const filterData: DatasetItemType[] = [];

  data.forEach((item) => {
    if (!item.q) return;

    const text = item.q + item.a;

    // count q token
    const token = modelToolMap.countTokens({
      messages: [{ obj: 'System', value: item.q }]
    });

    if (token > modeMaxToken[mode]) {
      return;
    }

    if (!set.has(text)) {
      filterData.push(item);
      set.add(text);
    }
  });

  // database deduplication
  const insertData = (
    await Promise.allSettled(
      filterData.map(async (data) => {
        let { q, a } = data;
        if (mode !== TrainingModeEnum.index) {
          return Promise.resolve(data);
        }

        if (!q) {
          return Promise.reject('q is empty');
        }

        q = q.replace(/\\n/g, '\n').trim().replace(/'/g, '"');
        a = a.replace(/\\n/g, '\n').trim().replace(/'/g, '"');

        // Exactly the same data, not push
        try {
          const { rows } = await PgClient.query(`
            SELECT COUNT(*) > 0 AS exists
            FROM  ${PgTrainingTableName} 
            WHERE md5(q)=md5('${q}') AND md5(a)=md5('${a}') AND user_id='${userId}' AND kb_id='${kbId}'
          `);
          const exists = rows[0]?.exists || false;

          if (exists) {
            return Promise.reject('已经存在');
          }
        } catch (error) {
          console.log(error);
          error;
        }
        return Promise.resolve(data);
      })
    )
  )
    .filter((item) => item.status === 'fulfilled')
    .map<DatasetItemType>((item: any) => item.value);

  //Insert record
  const insertRes = await TrainingData.insertMany(
    insertData.map((item) => ({
      ...item,
      userId,
      kbId,
      mode,
      prompt,
      vectorModel: vectorModel.model
    }))
  );

  insertRes.length > 0 && startQueue();

  return {
    insertLen: insertRes.length
  };
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb'
    }
  }
};
