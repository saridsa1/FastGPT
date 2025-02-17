import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, KB } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import type { KbUpdateParams } from '@/api/request/kb';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { id, name, tags, avatar } = req.body as KbUpdateParams;

    if (!id || !name) {
      throw new Error('Missing parameter');
    }

    //Certificate verification
    const { userId } = await authUser({ req, authToken: true });

    await connectToDatabase();

    await KB.findOneAndUpdate(
      {
        _id: id,
        userId
      },
      {
        avatar,
        name,
        tags: tags.split(' ').filter((item) => item)
      }
    );

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
