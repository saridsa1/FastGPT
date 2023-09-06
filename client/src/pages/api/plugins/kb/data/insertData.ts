import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, KB } from '@/service/mongo';
import { authKb, authUser } from '@/service/utils/auth';
import { withNextCors } from '@/service/utils/tools';
import { PgTrainingTableName } from '@/constants/plugin';
import { insertKbItem, PgClient } from '@/service/pg';
import { modelToolMap } from '@/utils/plugin';
import { getVectorModel } from '@/service/utils/data';
import { getVector } from '@/pages/api/openapi/plugin/vector';
import { DatasetItemType } from '@/types/plugin';

export type Props = {
  kbId: string;
  data: DatasetItemType;
};

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();

    const { kbId, data = { q: '', a: '' } } = req.body as Props;

    if (!kbId || !data?.q) {
      throw new Error('Missing parameter');
    }

    //Certificate verification
    const { userId } = await authUser({ req });

    //auth-kb
    const kb = await authKb({ kbId, userId });

    const q = data?.q?.replace(/\\n/g, '\n').trim().replace(/'/g, '"');
    const a = data?.a?.replace(/\\n/g, '\n').trim().replace(/'/g, '"');

    // token check
    const token = modelToolMap.countTokens({
      messages: [{ obj: 'System', value: q }]
    });

    if (token > getVectorModel(kb.vectorModel).maxToken) {
      throw new Error('Over Tokens');
    }

    const { rows: existsRows } = await PgClient.query(`
    SELECT COUNT(*) > 0 AS exists
    FROM  ${PgTrainingTableName} 
    WHERE md5(q)=md5('${q}') AND md5(a)=md5('${a}') AND user_id='${userId}' AND kb_id='${kbId}'
  `);
    const exists = existsRows[0]?.exists || false;

    if (exists) {
      throw new Error('Exactly consistent data already exists');
    }

    const { vectors } = await getVector({
      model: kb.vectorModel,
      input: [q],
      userId
    });

    const response = await insertKbItem({
      userId,
      kbId,
      data: [
        {
          q,
          a,
          source: data.source,
          vector: vectors[0]
        }
      ]
    });

    // @ts-ignore
    const id = response?.rows?.[0]?.id || '';

    jsonRes(res, {
      data: id
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});
