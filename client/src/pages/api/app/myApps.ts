import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, App } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import { AppListItemType } from '@/types/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // credential verification
    const { userId } = await authUser({ req, authToken: true });

    await connectToDatabase();

    // Get model information according to userId
    const myApps = await App.find(
      {
        userId
      },
      '_id avatar name intro'
    ).sort({
      updateTime: -1
    });

    jsonRes<AppListItemType[]>(res, {
      data: myApps
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
