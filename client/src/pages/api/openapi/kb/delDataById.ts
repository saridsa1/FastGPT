import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authUser } from '@/service/utils/auth';
import { PgClient } from '@/service/pg';
import { withNextCors } from '@/service/utils/tools';
import { PgTrainingTableName } from '@/constants/plugin';

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let { dataId } = req.query as {
      dataId: string;
    };

    if (!dataId) {
      throw new Error('Missing parameter');
    }

    //Certificate verification
    const { userId } = await authUser({ req });

    await PgClient.delete(PgTrainingTableName, {
      where: [['user_id', userId], 'AND', ['id', dataId]]
    });

    jsonRes(res);
  } catch (err) {
    console.log(err);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});
