import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, ChatItem } from '@/service/mongo';
import { AdminUpdateFeedbackParams } from '@/api/request/chat';
import { authUser } from '@/service/utils/auth';

/* Initialize my chat box, authentication required */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { chatItemId, kbId, dataId, content = undefined } = req.body as AdminUpdateFeedbackParams;

    if (!chatItemId || !kbId || !dataId || !content) {
      throw new Error('missing parameter');
    }

    const { userId } = await authUser({ req, authToken: true });

    await ChatItem.findOneAndUpdate(
      {
        userId,
        dataId: chatItemId
      },
      {
        adminFeedback: {
          kbId,
          dataId,
          content
        }
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
