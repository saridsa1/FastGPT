import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { Chat, App, connectToDatabase, Collection, OutLink } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import { authApp } from '@/service/utils/auth';

/* get my model */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { appId } = req.query as { appId: string };

    if (!appId) {
      throw new Error('Parameter error');
    }

    // credential verification
    const { userId } = await authUser({ req, authToken: true });

    await connectToDatabase();

    //Verify whether it is the user's app
    await authApp({
      appId,
      userId
    });

    //Delete the corresponding chat
    await Chat.deleteMany({
      appId
    });

    //Delete favorite list
    await Collection.deleteMany({
      modelId: appId
    });

    // Delete sharing link
    await OutLink.deleteMany({
      appId
    });

    //delete model
    await App.deleteOne({
      _id: appId,
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
