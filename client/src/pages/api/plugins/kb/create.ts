import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, KB } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import type { CreateKbParams } from '@/api/request/kb';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { name, tags, avatar, vectorModel } = req.body as CreateKbParams;

    if (!name || !vectorModel) {
      throw new Error('Missing parameter');
    }

    //Certificate verification
    const { userId } = await authUser({ req, authToken: true });

    await connectToDatabase();

    const { _id } = await KB.create({
      name,
      userId,
      tags,
      vectorModel,
      avatar
    });

    jsonRes(res, { data: _id });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
