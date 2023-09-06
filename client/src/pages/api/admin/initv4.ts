// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authUser } from '@/service/utils/auth';
import { connectToDatabase, App } from '@/service/mongo';
import { FlowModuleTypeEnum, SpecialInputKeyEnum } from '@/constants/flow';
import { TaskResponseKeyEnum } from '@/constants/chat';
import { FlowInputItemType } from '@/types/flow';

const chatModelInput = ({
  model,
  temperature,
  maxToken,
  systemPrompt,
  limitPrompt,
  kbList
}: {
  model: string;
  temperature: number;
  maxToken: number;
  systemPrompt: string;
  limitPrompt: string;
  kbList: { kbId: string }[];
}): FlowInputItemType[] => [
  {
    key: 'model',
    value: model,
    type: 'custom',
    label: 'dialogue model',
    connected: true
  },
  {
    key: 'temperature',
    value: temperature,
    label: 'temperature',
    type: 'slider',
    connected: true
  },
  {
    key: 'maxToken',
    value: maxToken,
    type: 'custom',
    label: 'reply upper limit',
    connected: true
  },
  {
    key: 'systemPrompt',
    value: systemPrompt,
    type: 'textarea',
    label: 'system prompt word',
    connected: true
  },
  {
    key: 'limitPrompt',
    label: 'qualifier',
    type: 'textarea',
    value: limitPrompt,
    connected: true
  },
  {
    key: 'switch',
    type: 'target',
    label: 'trigger',
    connected: kbList.length > 0
  },
  {
    key: 'quoteQA',
    type: 'target',
    label: 'reference content',
    connected: kbList.length > 0
  },
  {
    key: 'history',
    type: 'target',
    label: 'Chat history',
    connected: true
  },
  {
    key: 'userChatInput',
    type: 'target',
    label: 'User Question',
    connected: true
  }
];
const chatTemplate = ({
  model,
  temperature,
  maxToken,
  systemPrompt,
  limitPrompt
}: {
  model: string;
  temperature: number;
  maxToken: number;
  systemPrompt: string;
  limitPrompt: string;
}) => {
  return [
    {
      flowType: FlowModuleTypeEnum.questionInput,
      inputs: [
        {
          key: 'userChatInput',
          connected: true
        }
      ],
      outputs: [
        {
          key: 'userChatInput',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'userChatInput'
            }
          ]
        }
      ],
      position: {
        x: 464.32198615344566,
        y: 1602.2698463081606
      },
      moduleId: 'userChatInput'
    },
    {
      flowType: FlowModuleTypeEnum.historyNode,
      inputs: [
        {
          key: 'maxContext',
          value: 10,
          connected: true
        },
        {
          key: 'history',
          connected: true
        }
      ],
      outputs: [
        {
          key: 'history',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'history'
            }
          ]
        }
      ],
      position: {
        x: 452.5466249541586,
        y: 1276.3930310334215
      },
      moduleId: 'history'
    },
    {
      flowType: FlowModuleTypeEnum.chatNode,
      inputs: chatModelInput({
        model,
        temperature,
        maxToken,
        systemPrompt,
        limitPrompt,
        kbList: []
      }),
      outputs: [
        {
          key: TaskResponseKeyEnum.answerText,
          targets: []
        }
      ],
      position: {
        x: 981.9682828103937,
        y: 890.014595014464
      },
      moduleId: 'chatModule'
    }
  ];
};
const kbTemplate = ({
  model,
  temperature,
  maxToken,
  systemPrompt,
  limitPrompt,
  kbList = [],
  searchSimilarity,
  searchLimit,
  searchEmptyText
}: {
  model: string;
  temperature: number;
  maxToken: number;
  systemPrompt: string;
  limitPrompt: string;
  kbList: { kbId: string }[];
  searchSimilarity: number;
  searchLimit: number;
  searchEmptyText: string;
}) => {
  return [
    {
      flowType: FlowModuleTypeEnum.questionInput,
      inputs: [
        {
          key: 'userChatInput',
          connected: true
        }
      ],
      outputs: [
        {
          key: 'userChatInput',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'userChatInput'
            },
            {
              moduleId: 'kbSearch',
              key: 'userChatInput'
            }
          ]
        }
      ],
      position: {
        x: 464.32198615344566,
        y: 1602.2698463081606
      },
      moduleId: 'userChatInput'
    },
    {
      flowType: FlowModuleTypeEnum.historyNode,
      inputs: [
        {
          key: 'maxContext',
          value: 10,
          connected: true
        },
        {
          key: 'history',
          connected: true
        }
      ],
      outputs: [
        {
          key: 'history',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'history'
            }
          ]
        }
      ],
      position: {
        x: 452.5466249541586,
        y: 1276.3930310334215
      },
      moduleId: 'history'
    },
    {
      flowType: FlowModuleTypeEnum.kbSearchNode,
      inputs: [
        {
          key: 'kbList',
          value: kbList,
          connected: true
        },
        {
          key: 'similarity',
          value: searchSimilarity,
          connected: true
        },
        {
          key: 'limit',
          value: searchLimit,
          connected: true
        },
        {
          key: 'switch',
          connected: false
        },
        {
          key: 'userChatInput',
          connected: true
        }
      ],
      outputs: [
        {
          key: 'isEmpty',
          targets: searchEmptyText
            ? [
                {
                  moduleId: 'emptyText',
                  key: 'switch'
                }
              ]
            : [
                {
                  moduleId: 'chatModule',
                  key: 'switch'
                }
              ]
        },
        {
          key: 'unEmpty',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'switch'
            }
          ]
        },
        {
          key: 'quoteQA',
          targets: [
            {
              moduleId: 'chatModule',
              key: 'quoteQA'
            }
          ]
        }
      ],
      position: {
        x: 956.0838440206068,
        y: 887.462827870246
      },
      moduleId: 'kbSearch'
    },
    ...(searchEmptyText
      ? [
          {
            flowType: FlowModuleTypeEnum.answerNode,
            inputs: [
              {
                key: 'switch',
                connected: true
              },
              {
                key: SpecialInputKeyEnum.answerText,
                value: searchEmptyText,
                connected: true
              }
            ],
            outputs: [],
            position: {
              x: 1553.5815811529146,
              y: 637.8753731306779
            },
            moduleId: 'emptyText'
          }
        ]
      : []),
    {
      flowType: FlowModuleTypeEnum.chatNode,
      inputs: chatModelInput({ model, temperature, maxToken, systemPrompt, limitPrompt, kbList }),
      outputs: [
        {
          key: TaskResponseKeyEnum.answerText,
          targets: []
        }
      ],
      position: {
        x: 1551.71405495818,
        y: 977.4911578918461
      },
      moduleId: 'chatModule'
    }
  ];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authUser({ req, authRoot: true });
    await connectToDatabase();

    const { limit = 1000 } = req.body as { limit: number };
    let skip = 0;
    const total = await App.countDocuments();
    let promise = Promise.resolve();
    console.log(total);

    for (let i = 0; i < total; i += limit) {
      const skipVal = skip;
      skip += limit;
      promise = promise
        .then(() => init(limit, skipVal))
        .then(() => {
          console.log(skipVal);
        });
    }

    await promise;

    jsonRes(res, {});
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}

async function init(limit: number, skip: number) {
  // loop through apps
  const apps = await App.find(
    {
      chat: { $ne: null },
      modules: { $exists: false }
      // userId: '63f9a14228d2a688d8dc9e1b'
    },
    '_id chat'
  ).limit(limit);

  return Promise.all(
    apps.map(async (app) => {
      if (!app.chat) return app;
      const modules = (() => {
        if (app.chat.relatedKbs.length === 0) {
          return chatTemplate({
            model: app.chat.chatModel,
            temperature: app.chat.temperature,
            maxToken: app.chat.maxToken,
            systemPrompt: app.chat.systemPrompt,
            limitPrompt: app.chat.limitPrompt
          });
        } else {
          return kbTemplate({
            model: app.chat.chatModel,
            temperature: app.chat.temperature,
            maxToken: app.chat.maxToken,
            systemPrompt: app.chat.systemPrompt,
            limitPrompt: app.chat.limitPrompt,
            kbList: app.chat.relatedKbs.map((id) => ({ kbId: id })),
            searchEmptyText: app.chat.searchEmptyText,
            searchLimit: app.chat.searchLimit,
            searchSimilarity: app.chat.searchSimilarity
          });
        }
      })();

      await App.findByIdAndUpdate(app.id, {
        modules
      });
      return modules;
    })
  );
}
