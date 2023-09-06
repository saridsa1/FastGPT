import { SystemInputEnum } from '../app';
import { TaskResponseKeyEnum } from '../chat';
import {
  FlowModuleTypeEnum,
  FlowInputItemTypeEnum,
  FlowOutputItemTypeEnum,
  SpecialInputKeyEnum,
  FlowValueTypeEnum
} from './index';
import type { AppItemType } from '@/types/app';
import type { FlowModuleTemplateType } from '@/types/flow';
import { chatModelList } from '@/store/static';
import {
  Input_Template_History,
  Input_Template_TFSwitch,
  Input_Template_UserChatInput
} from './inputTemplate';
import { ContextExtractEnum, HttpPropsEnum } from './flowField';

export const ChatModelSystemTip =
  'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be pinned to the beginning of the context. Variables can be used, e.g. {{language}}';
export const ChatModelLimitTip =
  'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx". For other questions, reply: "xxxx"';
export const userGuideTip =
  'You can add special pre- and post-dialogue guidance modules to better allow users to engage in dialogue';
export const welcomeTextTip =
  'Before each conversation starts, send an initial content. Supports standard Markdown syntax, additional tags that can be used:\n[Shortcut keys]: users can click to directly send the question';

export const VariableModule: FlowModuleTemplateType = {
  logo: '/imgs/module/variable.png',
  name: 'global variable',
  intro:
    'Before the conversation starts, the user can be asked to fill in some content as variables for this round of conversation. This module is located after the opening guide. ',
  description:
    'Global variables can be injected into the string type input of other modules in the form of {{variable key}}, such as prompt words, qualifiers, etc.',
  flowType: FlowModuleTypeEnum.variable,
  inputs: [
    {
      key: SystemInputEnum.variables,
      type: FlowInputItemTypeEnum.systemInput,
      label: 'Variable input',
      value: []
    }
  ],
  outputs: []
};
export const UserGuideModule: FlowModuleTemplateType = {
  logo: '/imgs/module/userGuide.png',
  name: 'User Guide',
  intro: userGuideTip,
  flowType: FlowModuleTypeEnum.userGuide,
  inputs: [
    {
      key: SystemInputEnum.welcomeText,
      type: FlowInputItemTypeEnum.input,
      label: 'opening'
    }
  ],
  outputs: []
};
export const UserInputModule: FlowModuleTemplateType = {
  logo: '/imgs/module/userChatInput.png',
  name: 'User question (dialogue entry)',
  intro:
    'The content entered by the user. This module usually serves as the entry point of the application. Users will first execute this module after sending a message. ',
  flowType: FlowModuleTypeEnum.questionInput,
  inputs: [
    {
      key: SystemInputEnum.userChatInput,
      type: FlowInputItemTypeEnum.systemInput,
      label: 'User question'
    }
  ],
  outputs: [
    {
      key: SystemInputEnum.userChatInput,
      label: 'User question',
      type: FlowOutputItemTypeEnum.source,
      valueType: FlowValueTypeEnum.string,
      targets: []
    }
  ]
};
export const HistoryModule: FlowModuleTemplateType = {
  logo: '/imgs/module/history.png',
  name: 'Chat history',
  intro:
    'The content entered by the user. This module usually serves as the entry point of the application. Users will first execute this module after sending a message. ',
  flowType: FlowModuleTypeEnum.historyNode,
  inputs: [
    {
      key: 'maxContext',
      type: FlowInputItemTypeEnum.numberInput,
      label: 'The longest record number',
      value: 6,
      min: 0,
      max: 50
    },
    {
      key: SystemInputEnum.history,
      type: FlowInputItemTypeEnum.hidden,
      label: 'Chat history'
    }
  ],
  outputs: [
    {
      key: SystemInputEnum.history,
      label: 'Chat history',
      valueType: FlowValueTypeEnum.chatHistory,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};

export const ChatModule: FlowModuleTemplateType = {
  logo: '/imgs/module/AI.png',
  name: 'AI dialogue',
  intro: 'AI large model dialogue',
  flowType: FlowModuleTypeEnum.chatNode,
  showStatus: true,
  inputs: [
    {
      key: 'model',
      type: FlowInputItemTypeEnum.custom,
      label: 'dialogue model',
      value: chatModelList[0]?.model,
      list: chatModelList.map((item) => ({ label: item.name, value: item.model }))
    },
    {
      key: 'temperature',
      type: FlowInputItemTypeEnum.slider,
      label: 'temperature',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      markList: [
        { label: 'rigorous', value: 0 },
        { label: 'divergent', value: 10 }
      ]
    },
    {
      key: 'maxToken',
      type: FlowInputItemTypeEnum.custom,
      label: 'reply upper limit',
      value: chatModelList[0] ? chatModelList[0].contextMaxToken / 2 : 2000,
      min: 100,
      max: chatModelList[0]?.contextMaxToken || 4000,
      step: 50,
      markList: [
        { label: '100', value: 100 },
        {
          label: `${chatModelList[0]?.contextMaxToken || 4000}`,
          value: chatModelList[0]?.contextMaxToken || 4000
        }
      ]
    },
    {
      key: 'systemPrompt',
      type: FlowInputItemTypeEnum.textarea,
      label: 'system prompt word',
      valueType: FlowValueTypeEnum.string,
      description: ChatModelSystemTip,
      placeholder: ChatModelSystemTip,
      value: ''
    },
    {
      key: 'limitPrompt',
      type: FlowInputItemTypeEnum.textarea,
      valueType: FlowValueTypeEnum.string,
      label: 'qualifier',
      description: ChatModelLimitTip,
      placeholder: ChatModelLimitTip,
      value: ''
    },
    Input_Template_TFSwitch,
    {
      key: 'quoteQA',
      type: FlowInputItemTypeEnum.target,
      label: 'Quote content',
      valueType: FlowValueTypeEnum.kbQuote
    },
    Input_Template_History,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: TaskResponseKeyEnum.answerText,
      label: 'Model reply',
      description: 'Will be triggered after the stream reply is completed',
      valueType: FlowValueTypeEnum.string,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: 'finish',
      label: 'end of reply',
      description: 'Triggered after AI reply is completed',
      valueType: FlowValueTypeEnum.boolean,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};

export const KBSearchModule: FlowModuleTemplateType = {
  logo: '/imgs/module/db.png',
  name: 'Knowledge Base Search',
  intro:
    'Search for the corresponding answer in the knowledge base. Can be used as a reference for AI conversation quotes. ',
  flowType: FlowModuleTypeEnum.kbSearchNode,
  showStatus: true,
  inputs: [
    {
      key: 'kbList',
      type: FlowInputItemTypeEnum.custom,
      label: 'Associated knowledge base',
      value: [],
      list: []
    },
    {
      key: 'similarity',
      type: FlowInputItemTypeEnum.slider,
      label: 'similarity',
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
      markList: [
        { label: '100', value: 100 },
        { label: '1', value: 1 }
      ]
    },
    {
      key: 'limit',
      type: FlowInputItemTypeEnum.slider,
      label: 'Single search limit',
      description: 'Take up to n records as references for this question',
      value: 5,
      min: 1,
      max: 20,
      step: 1,
      markList: [
        { label: '1', value: 1 },
        { label: '20', value: 20 }
      ]
    },
    Input_Template_TFSwitch,
    Input_Template_UserChatInput
  ],
  outputs: [
    {
      key: 'isEmpty',
      label: 'Search results are empty',
      type: FlowOutputItemTypeEnum.source,
      valueType: FlowValueTypeEnum.boolean,
      targets: []
    },
    {
      key: 'unEmpty',
      label: 'Search results are not empty',
      type: FlowOutputItemTypeEnum.source,
      valueType: FlowValueTypeEnum.boolean,
      targets: []
    },
    {
      key: 'quoteQA',
      label: 'reference content',
      description:
        'Always return an array. If you want to perform additional operations when the search result is empty, you need to use the above two inputs and the trigger of the target module',
      type: FlowOutputItemTypeEnum.source,
      valueType: FlowValueTypeEnum.kbQuote,
      targets: []
    }
  ]
};

export const AnswerModule: FlowModuleTemplateType = {
  logo: '/imgs/module/reply.png',
  name: 'specified reply',
  intro:
    'This module can directly reply to a specified piece of content. Often used for guidance and prompts',
  description:
    'This module can directly reply to a specified piece of content. Often used for guidance and prompts',
  flowType: FlowModuleTypeEnum.answerNode,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: SpecialInputKeyEnum.answerText,
      type: FlowInputItemTypeEnum.textarea,
      valueType: FlowValueTypeEnum.string,
      value: '',
      label: 'reply content',
      description:
        'You can use \\n to achieve line breaks. Replies can also be implemented through external module input. When the external module is input, the currently filled content will be overwritten'
    }
  ],
  outputs: [
    {
      key: 'finish',
      label: 'End of reply',
      description: 'Triggered after reply is completed',
      valueType: FlowValueTypeEnum.boolean,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const TFSwitchModule: FlowModuleTemplateType = {
  logo: '',
  name: 'TF switch',
  intro:
    'You can determine whether the input content is True or False, and perform different operations. ',
  flowType: FlowModuleTypeEnum.tfSwitchNode,
  inputs: [
    {
      key: SystemInputEnum.switch,
      type: FlowInputItemTypeEnum.target,
      label: 'input'
    }
  ],
  outputs: [
    {
      key: 'true',
      label: 'True',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: 'false',
      label: 'False',
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const ClassifyQuestionModule: FlowModuleTemplateType = {
  logo: '/imgs/module/cq.png',
  name: 'Problem Classification',
  intro:
    'You can determine which aspect the users problem belongs to and perform different operations. ',
  description:
    'Determine the type of question based on the users history and current questions. Multiple groups of question types can be added. The following is a template example:\nType 1: Say hello\nType 2: General questions about laf\nType 3: About laf code questions\nType 4: Other questions',
  flowType: FlowModuleTypeEnum.classifyQuestion,
  showStatus: true,
  inputs: [
    {
      key: 'systemPrompt',
      type: FlowInputItemTypeEnum.textarea,
      valueType: FlowValueTypeEnum.string,
      value: '',
      label: 'System prompt word',
      description:
        'You can add some specific content introduction to better identify the users question type. This content usually introduces a content to the model that it does not know. ',
      placeholder:
        'For example: \n1. Laf is a cloud function development platform...\n2. Sealos is a cluster operating system'
    },
    Input_Template_History,
    Input_Template_UserChatInput,
    {
      key: SpecialInputKeyEnum.agents,
      type: FlowInputItemTypeEnum.custom,
      label: '',
      value: [
        {
          value: 'Say hello',
          key: 'fasw'
        },
        {
          value: 'Questions about xxx',
          key: 'fqsw'
        },
        {
          value: 'Other questions',
          key: 'fesw'
        }
      ]
    }
  ],
  outputs: [
    {
      key: 'fasw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    },
    {
      key: 'fqsw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    },
    {
      key: 'fesw',
      label: '',
      type: FlowOutputItemTypeEnum.hidden,
      targets: []
    }
  ]
};
export const ContextExtractModule: FlowModuleTemplateType = {
  logo: '/imgs/module/extract.png',
  name: 'Text content extraction',
  intro: 'Extract the data in the specified format from the text',
  description:
    'The specified data can be extracted from the text, such as: sql statement, search keyword, code, etc.',
  flowType: FlowModuleTypeEnum.contentExtract,
  showStatus: true,
  inputs: [
    Input_Template_TFSwitch,
    {
      key: ContextExtractEnum.description,
      type: FlowInputItemTypeEnum.textarea,
      valueType: FlowValueTypeEnum.string,
      value: '',
      label: 'Extract request description',
      description: 'Write an extraction request to tell AI what content needs to be extracted',
      required: true,
      placeholder:
        'Example: \n1. You are a lab appointment assistant. According to the users question, extract the name, laboratory number and appointment time'
    },
    Input_Template_History,
    {
      key: ContextExtractEnum.content,
      type: FlowInputItemTypeEnum.target,
      label: 'text to be extracted',
      required: true,
      valueType: FlowValueTypeEnum.string
    },
    {
      key: ContextExtractEnum.extractKeys,
      type: FlowInputItemTypeEnum.custom,
      label: 'target field',
      description:
        "A target field is composed of 'description' and 'key', and multiple target fields can be extracted",
      value: []
    }
  ],
  outputs: [
    {
      key: ContextExtractEnum.success,
      label: 'field complete extraction',
      valueType: FlowValueTypeEnum.boolean,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: ContextExtractEnum.failed,
      label: 'The extraction field is missing',
      valueType: FlowValueTypeEnum.boolean,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    },
    {
      key: ContextExtractEnum.fields,
      label: 'Complete extraction results',
      description: 'A JSON string, for example: {"name:":"YY","Time":"2023/7/2 18:00"}',
      valueType: FlowValueTypeEnum.string,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const HttpModule: FlowModuleTemplateType = {
  logo: '/imgs/module/http.png',
  name: 'HTTP module',
  intro:
    'An HTTP POST request can be issued to achieve more complex operations (network search, database query, etc.)',
  description:
    'A HTTP POST request can be issued to achieve more complex operations (network search, database query, etc.)',
  flowType: FlowModuleTypeEnum.httpRequest,
  showStatus: true,
  inputs: [
    {
      key: HttpPropsEnum.url,
      value: '',
      type: FlowInputItemTypeEnum.input,
      label: 'request address',
      description: 'Request target address',
      placeholder: 'https://api.fastgpt.run/getInventory',
      required: true
    },
    Input_Template_TFSwitch
  ],
  outputs: [
    {
      key: HttpPropsEnum.finish,
      label: 'Request end',
      valueType: FlowValueTypeEnum.boolean,
      type: FlowOutputItemTypeEnum.source,
      targets: []
    }
  ]
};
export const EmptyModule: FlowModuleTemplateType = {
  logo: '/imgs/module/cq.png',
  name: 'The module has been removed',
  intro: '',
  description: '',
  flowType: FlowModuleTypeEnum.empty,
  inputs: [],
  outputs: []
};

export const ModuleTemplates = [
  {
    label: 'Input module',
    list: [UserInputModule, HistoryModule]
  },
  {
    label: 'Guide module',
    list: [UserGuideModule, VariableModule]
  },
  {
    label: 'Content Generation',
    list: [ChatModule, AnswerModule]
  },
  {
    label: 'Knowledge Base Module',
    list: [KBSearchModule]
  },
  {
    label: 'Agent',
    list: [ClassifyQuestionModule, ContextExtractModule, HttpModule]
  }
];
export const ModuleTemplatesFlat = ModuleTemplates.map((templates) => templates.list)?.flat();

// template
export const appTemplates: (AppItemType & { avatar: string; intro: string })[] = [
  {
    id: 'simpleChat',
    avatar: '/imgs/module/AI.png',
    name: 'Simple dialogue',
    intro: 'An extremely simple AI conversation application',
    modules: [
      {
        moduleId: 'userChatInput',
        name: 'User question (dialogue entry)',
        flowType: 'questionInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            type: 'systemInput',
            label: 'User Question',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'User question',
            type: 'source',
            valueType: 'string',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'history',
        name: 'Chat history',
        flowType: 'historyNode',
        position: {
          x: 452.5466249541586,
          y: 1276.3930310334215
        },
        inputs: [
          {
            key: 'maxContext',
            type: 'numberInput',
            label: 'Longest number of records',
            value: 6,
            min: 0,
            max: 50,
            connected: true
          },
          {
            key: 'history',
            type: 'hidden',
            label: 'Chat history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            label: 'Chat history',
            valueType: 'chat_history',
            type: 'source',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        name: 'AI dialogue',
        flowType: 'chatNode',
        showStatus: true,
        position: {
          x: 1150.8317145593148,
          y: 957.9676672880053
        },
        inputs: [
          {
            key: 'model',
            type: 'custom',
            label: 'dialogue model',
            value: 'gpt-3.5-turbo-16k',
            list: [],
            connected: true
          },
          {
            key: 'temperature',
            type: 'slider',
            label: 'temperature',
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: 'rigorous',
                value: 0
              },
              {
                label: 'divergent',
                value: 10
              }
            ],
            connected: true
          },
          {
            key: 'maxToken',
            type: 'custom',
            label: 'reply upper limit',
            value: 8000,
            min: 100,
            max: 16000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '16000',
                value: 16000
              }
            ],
            connected: true
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            label: 'System prompt word',
            valueType: 'string',
            description:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be anchored at the beginning of the context. Variables can be used, such as {{language}}',
            placeholder:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be anchored at the beginning of the context. Variables can be used, such as {{language}}',
            value: '',
            connected: true
          },
          {
            key: 'limitPrompt',
            type: 'textarea',
            valueType: 'string',
            label: 'qualifier',
            description:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            placeholder:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            value: '',
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: false
          },
          {
            key: 'quoteQA',
            type: 'target',
            label: 'Quote content',
            valueType: 'kb_quote',
            connected: false
          },
          {
            key: 'history',
            type: 'target',
            label: 'Chat history',
            valueType: 'chat_history',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            label: 'Model reply',
            description: 'Direct response, no configuration required',
            type: 'hidden',
            targets: []
          },
          {
            key: 'finish',
            label: 'End of reply',
            description: 'Triggered after the AI ​​reply is completed',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      }
    ]
  },
  {
    id: 'simpleKbChat',
    avatar: '/imgs/module/db.png',
    name: 'Knowledge Base + Dialogue Guidance',
    intro:
      'A knowledge base search is performed every time a question is asked, and the search results are injected into the LLM model for reference answering',
    modules: [
      {
        moduleId: 'userGuide',
        name: 'User Guide',
        flowType: 'userGuide',
        position: {
          x: 454.98510354678695,
          y: 721.4016845336229
        },
        inputs: [
          {
            key: 'welcomeText',
            type: 'input',
            label: 'opening',
            value: 'Hello, I am assistant laf, how can I help you? ',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'userChatInput',
        name: 'User question (dialogue entry)',
        flowType: 'questionInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            type: 'systemInput',
            label: 'User question',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'User question',
            type: 'source',
            valueType: 'string',
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
        ]
      },
      {
        moduleId: 'history',
        name: 'Chat history',
        flowType: 'historyNode',
        position: {
          x: 452.5466249541586,
          y: 1276.3930310334215
        },
        inputs: [
          {
            key: 'maxContext',
            type: 'numberInput',
            label: 'The longest record number',
            value: 6,
            min: 0,
            max: 50,
            connected: true
          },
          {
            key: 'history',
            type: 'hidden',
            label: 'Chat records',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            label: 'Chat records',
            valueType: 'chat_history',
            type: 'source',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'kbSearch',
        name: 'Knowledge Base Search',
        flowType: 'kbSearchNode',
        showStatus: true,
        position: {
          x: 956.0838440206068,
          y: 887.462827870246
        },
        inputs: [
          {
            key: 'kbList',
            type: 'custom',
            label: 'Associated knowledge base',
            value: [],
            list: [],
            connected: true
          },
          {
            key: 'similarity',
            type: 'slider',
            label: 'similarity',
            value: 0.4,
            min: 0,
            max: 1,
            step: 0.01,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '1',
                value: 1
              }
            ],
            connected: true
          },
          {
            key: 'limit',
            type: 'slider',
            label: 'Single search limit',
            description: 'Take at most n records as references for this question',
            value: 5,
            min: 1,
            max: 20,
            step: 1,
            markList: [
              {
                label: '1',
                value: 1
              },
              {
                label: '20',
                value: 20
              }
            ],
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: false
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'isEmpty',
            label: 'The search result is empty',
            type: 'source',
            valueType: 'boolean',
            targets: [
              {
                moduleId: '2752oj',
                key: 'switch'
              }
            ]
          },
          {
            key: 'unEmpty',
            label: 'Search result is not empty',
            type: 'source',
            valueType: 'boolean',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'switch'
              }
            ]
          },
          {
            key: 'quoteQA',
            label: 'reference content',
            description:
              'Always return an array, if you want to perform additional operations when the search result is empty, you need to use the above two inputs and the trigger of the target module',
            type: 'source',
            valueType: 'kb_quote',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'quoteQA'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        name: 'AI dialogue',
        flowType: 'chatNode',
        showStatus: true,
        position: {
          x: 1546.0823206390796,
          y: 1008.9827344021824
        },
        inputs: [
          {
            key: 'model',
            type: 'custom',
            label: 'dialogue model',
            value: 'gpt-3.5-turbo-16k',
            list: [],
            connected: true
          },
          {
            key: 'temperature',
            type: 'slider',
            label: 'temperature',
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: 'rigorous',
                value: 0
              },
              {
                label: 'divergent',
                value: 10
              }
            ],
            connected: true
          },
          {
            key: 'maxToken',
            type: 'custom',
            label: 'reply upper limit',
            value: 8000,
            min: 100,
            max: 16000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '16000',
                value: 16000
              }
            ],
            connected: true
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            label: 'system prompt word',
            valueType: 'string',
            description:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be pinned to the beginning of the context. Variables can be used, such as {{language}}',
            placeholder:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be pinned to the beginning of the context. Variables can be used, such as {{language}}',
            value: '',
            connected: true
          },
          {
            key: 'limitPrompt',
            type: 'textarea',
            valueType: 'string',
            label: 'qualifier',
            description:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            placeholder:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            value: '',
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'quoteQA',
            type: 'target',
            label: 'Quote content',
            valueType: 'kb_quote',
            connected: true
          },
          {
            key: 'history',
            type: 'target',
            label: 'Chat records',
            valueType: 'chat_history',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            label: 'Model reply',
            description: 'Direct response, no configuration required',
            type: 'hidden',
            targets: []
          },
          {
            key: 'finish',
            label: 'End of reply',
            description: 'Triggered after the AI ​​reply is completed',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      },
      {
        moduleId: '2752oj',
        name: 'Specify reply',
        flowType: 'answerNode',
        position: {
          x: 1542.9271243684725,
          y: 702.7819618017722
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'text',
            value: 'Search results are empty',
            type: 'textarea',
            valueType: 'string',
            label: 'reply content',
            description:
              'You can use \\n to achieve line breaks. Reply can also be realized through external module input, and the current filled content will be overwritten when the external module is input',
            connected: true
          }
        ],
        outputs: []
      }
    ]
  },
  {
    id: 'chatGuide',
    avatar: '/imgs/module/userGuide.png',
    name: 'Dialogue guide + variable',
    intro:
      'You can send a prompt at the beginning of the dialogue, or let the user fill in some content as a variable for this dialogue',
    modules: [
      {
        moduleId: 'userGuide',
        name: 'User Guide',
        flowType: 'userGuide',
        position: {
          x: 447.98520778293346,
          y: 721.4016845336229
        },
        inputs: [
          {
            key: 'welcomeText',
            type: 'input',
            label: 'opening',
            value:
              'Hello, I can translate various languages for you. Please tell me what language you need to translate into? ',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'variable',
        name: 'global variable',
        flowType: 'variable',
        position: {
          x: 444.0369195277651,
          y: 1008.5185781784537
        },
        inputs: [
          {
            key: 'variables',
            type: 'systemInput',
            label: 'Variable input',
            value: [
              {
                id: '35c640eb-cf22-431f-bb57-3fc21643880e',
                key: 'language',
                label: 'target language',
                type: 'input',
                required: true,
                maxLen: 50,
                enums: [
                  {
                    value: ''
                  }
                ]
              },
              {
                id: '2011ff08-91aa-4f60-ae69-f311ab4797b3',
                key: 'language2',
                label: 'Drop-down box test',
                type: 'select',
                required: false,
                maxLen: 50,
                enums: [
                  {
                    value: 'English'
                  },
                  {
                    value: 'French'
                  }
                ]
              }
            ],
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'userChatInput',
        name: 'User question (dialogue entry)',
        flowType: 'questionInput',
        position: {
          x: 464.32198615344566,
          y: 1602.2698463081606
        },
        inputs: [
          {
            key: 'userChatInput',
            type: 'systemInput',
            label: 'User question',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'User Question',
            type: 'source',
            valueType: 'string',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'history',
        name: 'Chat records',
        flowType: 'historyNode',
        position: {
          x: 452.5466249541586,
          y: 1276.3930310334215
        },
        inputs: [
          {
            key: 'maxContext',
            type: 'numberInput',
            label: 'Longest number of records',
            value: 10,
            min: 0,
            max: 50,
            connected: true
          },
          {
            key: 'history',
            type: 'hidden',
            label: 'Chat records',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            label: 'Chat records',
            valueType: 'chat_history',
            type: 'source',
            targets: [
              {
                moduleId: 'chatModule',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'chatModule',
        name: 'AI dialogue',
        flowType: 'chatNode',
        showStatus: true,
        position: {
          x: 981.9682828103937,
          y: 890.014595014464
        },
        inputs: [
          {
            key: 'model',
            type: 'custom',
            label: 'Dialogue Model',
            value: 'gpt-3.5-turbo-16k',
            list: [],
            connected: true
          },
          {
            key: 'temperature',
            type: 'slider',
            label: 'temperature',
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: 'rigorous',
                value: 0
              },
              {
                label: 'divergence',
                value: 10
              }
            ],
            connected: true
          },
          {
            key: 'maxToken',
            type: 'custom',
            label: 'reply upper limit',
            value: 8000,
            min: 100,
            max: 16000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '16000',
                value: 16000
              }
            ],
            connected: true
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            label: 'System prompt word',
            valueType: 'string',
            description:
              'The models fixed guide word, by adjusting the content, can guide the models chat direction. The content will be anchored at the beginning of the context. Variables can be used, such as {{language}}',
            placeholder:
              'The models fixed guide word, by adjusting the content, can guide the models chat direction. The content will be anchored at the beginning of the context. Variables can be used, such as {{language}}',
            value: '',
            connected: true
          },
          {
            key: 'limitPrompt',
            type: 'textarea',
            valueType: 'string',
            label: 'qualifier',
            description:
              'Limited model dialogue scope will be placed before this question, with strong guidance and limitation. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction to Laf. Please refer to the knowledge base to answer questions. If the content has nothing to do with "Laf", directly reply: "I dont know". \n2. You only answer questions about "xxx". For other questions, reply: "xxxx"',
            placeholder:
              'Limited model dialogue scope will be placed before this question, with strong guidance and limitation. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction to Laf. Please refer to the knowledge base to answer questions. If the content has nothing to do with "Laf", directly reply: "I dont know". \n2. You only answer questions about "xxx". For other questions, reply: "xxxx"',
            value: 'Translate my question directly into English{{language}}',
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: false
          },
          {
            key: 'quoteQA',
            type: 'target',
            label: 'Quote content',
            valueType: 'kb_quote',
            connected: false
          },
          {
            key: 'history',
            type: 'target',
            label: 'Chat history',
            valueType: 'chat_history',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            label: 'Model reply',
            description: 'Direct response, no configuration required',
            type: 'hidden',
            targets: []
          },
          {
            key: 'finish',
            label: 'End of reply',
            description: 'Triggered after AI reply is completed',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      }
    ]
  },
  {
    id: 'CQ',
    avatar: '/imgs/module/cq.png',
    name: 'Problem classification + knowledge base',
    intro:
      'First classify the users problems, and then perform different operations according to different types of problems',
    modules: [
      {
        moduleId: '7z5g5h',
        name: 'User question (dialogue entry)',
        flowType: 'questionInput',
        position: {
          x: 198.56612928723575,
          y: 1622.7034463081607
        },
        inputs: [
          {
            key: 'userChatInput',
            type: 'systemInput',
            label: 'User question',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'userChatInput',
            label: 'User Question',
            type: 'source',
            valueType: 'string',
            targets: [
              {
                moduleId: 'remuj3',
                key: 'userChatInput'
              },
              {
                moduleId: 'nlfwkc',
                key: 'userChatInput'
              },
              {
                moduleId: 'fljhzy',
                key: 'userChatInput'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'xj0c9p',
        name: 'Chat records',
        flowType: 'historyNode',
        position: {
          x: 194.99102398958047,
          y: 1801.3545999721096
        },
        inputs: [
          {
            key: 'maxContext',
            type: 'numberInput',
            label: 'Longest number of records',
            value: 6,
            min: 0,
            max: 50,
            connected: true
          },
          {
            key: 'history',
            type: 'hidden',
            label: 'Chat records',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            label: 'Chat records',
            valueType: 'chat_history',
            type: 'source',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'remuj3',
        name: 'Problem Classification',
        flowType: 'classifyQuestion',
        showStatus: true,
        position: {
          x: 672.9092284362648,
          y: 1077.557793775116
        },
        inputs: [
          {
            key: 'systemPrompt',
            type: 'textarea',
            valueType: 'string',
            label: 'System prompt word',
            description:
              'You can add some specific content introduction to better identify the users question type. This content usually introduces a content to the model that it does not know. ',
            placeholder:
              'For example: \n1. Laf is a cloud function development platform...\n2. Sealos is a cluster operating system',
            value:
              'laf is a cloud development platform that can quickly develop applications\nlaf is an open source BaaS development platform (Backend as a Service)\nlaf is an out-of-the-box serverless development platform\nlaf is a collection of "function computing", " Database" and "Object Storage" are equal to a one-stop development platform\nlaf. It can be the open source version of Tencent Cloud Development, the open source version of Google Firebase, the open source version of UniCloud',
            connected: true
          },
          {
            key: 'history',
            type: 'target',
            label: 'Chat history',
            valueType: 'chat_history',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User question',
            required: true,
            valueType: 'string',
            connected: true
          },
          {
            key: 'agents',
            type: 'custom',
            label: '',
            value: [
              {
                value: 'Say hello, greetings and other questions',
                key: 'fasw'
              },
              {
                value: 'problem with "laf"',
                key: 'fqsw'
              },
              {
                value: 'Business issue',
                key: 'fesw'
              },
              {
                value: 'Other questions',
                key: 'oy1c'
              }
            ],
            connected: true
          }
        ],
        outputs: [
          {
            key: 'fasw',
            label: '',
            type: 'hidden',
            targets: [
              {
                moduleId: 'a99p6z',
                key: 'switch'
              }
            ]
          },
          {
            key: 'fqsw',
            label: '',
            type: 'hidden',
            targets: [
              {
                moduleId: 'fljhzy',
                key: 'switch'
              }
            ]
          },
          {
            key: 'fesw',
            label: '',
            type: 'hidden',
            targets: [
              {
                moduleId: '5v78ap',
                key: 'switch'
              }
            ]
          },
          {
            key: 'oy1c',
            label: '',
            type: 'hidden',
            targets: [
              {
                moduleId: 'iejcou',
                key: 'switch'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'a99p6z',
        name: 'specified reply',
        flowType: 'answerNode',
        position: {
          x: 1304.2886011902247,
          y: 776.1589509539264
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'text',
            value: 'Hello, I am assistant laf, how can I help you? ',
            type: 'textarea',
            valueType: 'string',
            label: 'reply content',
            description:
              'You can use \\n to achieve line breaks. Reply can also be realized through external module input, and the current filled content will be overwritten when the external module is input',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'iejcou',
        name: 'specified reply',
        flowType: 'answerNode',
        position: {
          x: 1294.2531189034548,
          y: 2127.1297123368286
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'text',
            value: 'Hi, I can only answer laf-related questions, do you have any questions? ',
            type: 'textarea',
            valueType: 'string',
            label: 'reply content',
            description:
              'You can use \\n to achieve line breaks. Reply can also be realized through external module input, and the current filled content will be overwritten when the external module is input',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'nlfwkc',
        name: 'AI dialogue',
        flowType: 'chatNode',
        showStatus: true,
        position: {
          x: 1821.979893659983,
          y: 1104.6583548423682
        },
        inputs: [
          {
            key: 'model',
            type: 'custom',
            label: 'dialogue model',
            value: 'gpt-3.5-turbo-16k',
            list: [],
            connected: true
          },
          {
            key: 'temperature',
            type: 'slider',
            label: 'temperature',
            value: 0,
            min: 0,
            max: 10,
            step: 1,
            markList: [
              {
                label: 'rigorous',
                value: 0
              },
              {
                label: 'divergence',
                value: 10
              }
            ],
            connected: true
          },
          {
            key: 'maxToken',
            type: 'custom',
            label: 'reply upper limit',
            value: 8000,
            min: 100,
            max: 4000,
            step: 50,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '4000',
                value: 4000
              }
            ],
            connected: true
          },
          {
            key: 'systemPrompt',
            type: 'textarea',
            label: 'system prompt word',
            valueType: 'string',
            description:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be pinned to the beginning of the context. Variables can be used, such as {{language}}',
            placeholder:
              'Model fixed guide word, by adjusting the content, you can guide the model chat direction. The content will be pinned to the beginning of the context. Variables can be used, such as {{language}}',
            value: 'The knowledge base is about laf. ',
            connected: true
          },
          {
            key: 'limitPrompt',
            type: 'textarea',
            valueType: 'string',
            label: 'qualifier',
            description:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            placeholder:
              'Limit the scope of the model dialogue, which will be placed before this question, with strong guidance and limitations. Variables can be used, such as {{language}}. Guidance example:\n1. The knowledge base is an introduction about Laf. Please refer to the knowledge base to answer questions. If it has nothing to do with "Laf", reply directly: "I dont know". \n2. You only answer questions about "xxx", other questions reply: "xxxx"',
            value:
              'My questions are all about laf. Answer my questions according to the knowledge base, if it has nothing to do with laf, reply directly: "I dont know, I can only answer questions related to laf.". ',
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'quoteQA',
            type: 'target',
            label: 'reference content',
            valueType: 'kb_quote',
            connected: true
          },
          {
            key: 'history',
            type: 'target',
            label: 'Chat records',
            valueType: 'chat_history',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'answerText',
            label: 'Model reply',
            description: 'Direct response, no configuration required',
            type: 'hidden',
            targets: []
          },
          {
            key: 'finish',
            label: 'End of reply',
            description: 'Triggered after the AI ​​reply is completed',
            valueType: 'boolean',
            type: 'source',
            targets: []
          }
        ]
      },
      {
        moduleId: 's4v9su',
        name: 'Chat records',
        flowType: 'historyNode',
        position: {
          x: 193.3803955457983,
          y: 1116.251200765746
        },
        inputs: [
          {
            key: 'maxContext',
            type: 'numberInput',
            label: 'The longest record number',
            value: 2,
            min: 0,
            max: 50,
            connected: true
          },
          {
            key: 'history',
            type: 'hidden',
            label: 'Chat history',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'history',
            label: 'Chat history',
            valueType: 'chat_history',
            type: 'source',
            targets: [
              {
                moduleId: 'remuj3',
                key: 'history'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'fljhzy',
        name: 'Knowledge Base Search',
        flowType: 'kbSearchNode',
        showStatus: true,
        position: {
          x: 1305.5374262228029,
          y: 1120.0404921820218
        },
        inputs: [
          {
            type: 'custom',
            label: 'Associated knowledge base',
            list: [],
            key: 'kbList',
            value: [],
            connected: true
          },
          {
            key: 'similarity',
            type: 'slider',
            label: 'similarity',
            value: 0.76,
            min: 0,
            max: 1,
            step: 0.01,
            markList: [
              {
                label: '100',
                value: 100
              },
              {
                label: '1',
                value: 1
              }
            ],
            connected: true
          },
          {
            key: 'limit',
            type: 'slider',
            label: 'Single search limit',
            description: 'Take at most n records as references for this question',
            value: 5,
            min: 1,
            max: 20,
            step: 1,
            markList: [
              {
                label: '1',
                value: 1
              },
              {
                label: '20',
                value: 20
              }
            ],
            connected: true
          },
          {
            key: 'switch',
            type: 'target',
            label: 'trigger',
            valueType: 'any',
            connected: true
          },
          {
            key: 'userChatInput',
            type: 'target',
            label: 'User Question',
            required: true,
            valueType: 'string',
            connected: true
          }
        ],
        outputs: [
          {
            key: 'isEmpty',
            label: 'Search results are empty',
            type: 'source',
            valueType: 'boolean',
            targets: [
              {
                moduleId: 'tc90wz',
                key: 'switch'
              }
            ]
          },
          {
            key: 'unEmpty',
            label: 'Search results not empty',
            type: 'source',
            valueType: 'boolean',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'switch'
              }
            ]
          },
          {
            key: 'quoteQA',
            label: 'Quoted content',
            description:
              'Always returns an array, if you want to perform additional operations when the search result is empty, you need to use the two inputs above and the target modules triggers',
            type: 'source',
            valueType: 'kb_quote',
            targets: [
              {
                moduleId: 'nlfwkc',
                key: 'quoteQA'
              }
            ]
          }
        ]
      },
      {
        moduleId: 'q9equb',
        name: 'user guidance',
        flowType: 'userGuide',
        position: {
          x: 191.4857498376603,
          y: 856.6847387508401
        },
        inputs: [
          {
            key: 'welcomeText',
            type: 'input',
            label: 'preamble (of speeches, articles etc)',
            value:
              'Hi, Im the laf assistant. How can I help you? \n [What is laf? Whats it for?] \n[laf online experience address]\n[Whats the official website address]',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: 'tc90wz',
        name: 'Designated response',
        flowType: 'answerNode',
        position: {
          x: 1828.4596416688908,
          y: 765.3628156185887
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'Starter',
            valueType: 'any',
            connected: true
          },
          {
            key: 'text',
            value:
              'I m sorry, I cant find your question, please describe your problem in more detail. ',
            type: 'textarea',
            valueType: 'string',
            label: 'Subject of the reply',
            description:
              'You can use \\n for line breaks. It is also possible to reply through the input of an external module, which will overwrite the currently filled in content when it is entered',
            connected: true
          }
        ],
        outputs: []
      },
      {
        moduleId: '5v78ap',
        name: 'Designated response',
        flowType: 'answerNode',
        position: {
          x: 1294.814522053934,
          y: 1822.7626988141562
        },
        inputs: [
          {
            key: 'switch',
            type: 'target',
            label: 'starter',
            valueType: 'any',
            connected: true
          },
          {
            key: 'text',
            value: 'Its a business issue',
            type: 'textarea',
            valueType: 'string',
            label: 'Subject of the reply',
            description:
              'You can use \\n for line breaks. It is also possible to reply through the input of an external module, which will overwrite the currently filled in content when it is entered',
            connected: true
          }
        ],
        outputs: []
      }
    ]
  }
];
