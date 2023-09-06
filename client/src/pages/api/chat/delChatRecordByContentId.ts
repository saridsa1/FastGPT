import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, ChatItem } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId, contentId } = req.query as { chatId: string; contentId: string };

    await connectToDatabase();

    //Certificate verification
    const { userId } = await authUser({ req, authToken: true });

    //Delete a database record
    await ChatItem.deleteOne({
      dataId: contentId,
      chatId,
      userId
    });

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
