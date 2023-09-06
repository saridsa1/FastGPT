import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { Chat, ChatItem } from '@/service/mongo';
import type { InitChatResponse } from '@/api/response/chat';
import { authUser } from '@/service/utils/auth';
import { ChatItemType } from '@/types/chat';
import { authApp } from '@/service/utils/auth';
import type { ChatSchema } from '@/types/mongoSchema';
import { getSpecialModule, getChatModelNameList } from '@/components/ChatBox/utils';
import { TaskResponseKeyEnum } from '@/constants/chat';

/* Initialize my chat box, authentication required */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await authUser({ req, authToken: true });

    let { appId, chatId } = req.query as {
      appId: '' | string;
      chatId: '' | string;
    };

    if (!appId) {
      return jsonRes(res, {
        code: 501,
        message: "You don't have an app yet"
      });
    }

    //Verify usage permissions
    const app = (
      await authApp({
        appId,
        userId,
        authUser: false,
        authOwner: false
      })
    ).app;

    //get app and history
    const { chat, history = [] }: { chat?: ChatSchema; history?: ChatItemType[] } =
      await (async () => {
        if (chatId) {
          // auth chatId
          const [chat, history] = await Promise.all([
            Chat.findOne(
              {
                chatId,
                userId
              },
              'title variables'
            ),
            ChatItem.find(
              {
                chatId,
                userId
              },
              `dataId obj value adminFeedback userFeedback ${TaskResponseKeyEnum.responseData}`
            )
              .sort({ _id: -1 })
              .limit(30)
          ]);
          if (!chat) {
            throw new Error('Chat box does not exist');
          }
          history.reverse();
          return { app, history, chat };
        }
        return {};
      })();

    if (!app) {
      throw new Error('Auth App Error');
    }

    const isOwner = String(app.userId) === userId;

    jsonRes<InitChatResponse>(res, {
      data: {
        chatId,
        appId,
        app: {
          ...getSpecialModule(app.modules),
          chatModels: getChatModelNameList(app.modules),
          name: app.name,
          avatar: app.avatar,
          intro: app.intro,
          canUse: app.share.isShare || isOwner
        },
        title: chat?.title || 'New conversation',
        variables: chat?.variables || {},
        history
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
