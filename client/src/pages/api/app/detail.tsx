import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase } from '@/service/mongo';
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

    const { app } = await authApp({
      appId,
      userId
    });

    jsonRes(res, {
      data: app
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
