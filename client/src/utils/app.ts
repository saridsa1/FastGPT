import type { AppModuleItemType, VariableItemType } from '@/types/app';
import { chatModelList, vectorModelList } from '@/store/static';
import {
  FlowInputItemTypeEnum,
  FlowModuleTypeEnum,
  FlowValueTypeEnum,
  SpecialInputKeyEnum
} from '@/constants/flow';
import { SystemInputEnum } from '@/constants/app';
import { TaskResponseKeyEnum } from '@/constants/chat';
import type { SelectedKbType } from '@/types/plugin';
import { FlowInputItemType } from '@/types/flow';

export type EditFormType = {
  chatModel: {
    model: string;
    systemPrompt: string;
    limitPrompt: string;
    temperature: number;
    maxToken: number;
    frequency: number;
    presence: number;
  };
  kb: {
    list: SelectedKbType;
    searchSimilarity: number;
    searchLimit: number;
    searchEmptyText: string;
  };
  guide: {
    welcome: {
      text: string;
    };
  };
  variables: VariableItemType[];
};
export const getDefaultAppForm = (): EditFormType => {
  const defaultChatModel = chatModelList[0];
  const defaultVectorModel = vectorModelList[0];
  return {
    chatModel: {
      model: defaultChatModel.model,
      systemPrompt: '',
      limitPrompt: '',
      temperature: 0,
      maxToken: defaultChatModel.contextMaxToken / 2,
      frequency: 0.5,
      presence: -0.5
    },
    kb: {
      list: [],
      searchSimilarity: 0.4,
      searchLimit: 5,
      searchEmptyText: ''
    },
    guide: {
      welcome: {
        text: ''
      }
    },
    variables: []
  };
};

export const appModules2Form = (modules: AppModuleItemType[]) => {
  const defaultAppForm = getDefaultAppForm();
  const updateVal = ({
    formKey,
    inputs,
    key
  }: {
    formKey: string;
    inputs: FlowInputItemType[];
    key: string;
  }) => {
    const propertyPath = formKey.split('.');
    let currentObj: any = defaultAppForm;
    for (let i = 0; i < propertyPath.length - 1; i++) {
      currentObj = currentObj[propertyPath[i]];
    }

    const val =
      inputs.find((item) => item.key === key)?.value ||
      currentObj[propertyPath[propertyPath.length - 1]];

    currentObj[propertyPath[propertyPath.length - 1]] = val;
  };

  modules.forEach((module) => {
    if (module.flowType === FlowModuleTypeEnum.chatNode) {
      updateVal({
        formKey: 'chatModel.model',
        inputs: module.inputs,
        key: 'model'
      });
      updateVal({
        formKey: 'chatModel.temperature',
        inputs: module.inputs,
        key: 'temperature'
      });
      updateVal({
        formKey: 'chatModel.maxToken',
        inputs: module.inputs,
        key: 'maxToken'
      });
      updateVal({
        formKey: 'chatModel.systemPrompt',
        inputs: module.inputs,
        key: 'systemPrompt'
      });
      updateVal({
        formKey: 'chatModel.limitPrompt',
        inputs: module.inputs,
        key: 'limitPrompt'
      });
    } else if (module.flowType === FlowModuleTypeEnum.kbSearchNode) {
      updateVal({
        formKey: 'kb.list',
        inputs: module.inputs,
        key: 'kbList'
      });
      updateVal({
        formKey: 'kb.searchSimilarity',
        inputs: module.inputs,
        key: 'similarity'
      });
      updateVal({
        formKey: 'kb.searchLimit',
        inputs: module.inputs,
        key: 'limit'
      });
      // empty text
      const emptyOutputs = module.outputs.find((item) => item.key === 'isEmpty')?.targets || [];
      const emptyOutput = emptyOutputs[0];
      if (emptyOutput) {
        const target = modules.find((item) => item.moduleId === emptyOutput.moduleId);
        defaultAppForm.kb.searchEmptyText =
          target?.inputs?.find((item) => item.key === SpecialInputKeyEnum.answerText)?.value || '';
      }
    } else if (module.flowType === FlowModuleTypeEnum.userGuide) {
      const val =
        module.inputs.find((item) => item.key === SystemInputEnum.welcomeText)?.value || '';
      if (val) {
        defaultAppForm.guide.welcome = {
          text: val
        };
      }
    } else if (module.flowType === FlowModuleTypeEnum.variable) {
      defaultAppForm.variables =
        module.inputs.find((item) => item.key === SystemInputEnum.variables)?.value || [];
    }
  });

  return defaultAppForm;
};

const chatModelInput = (formData: EditFormType): FlowInputItemType[] => [
  {
    key: 'model',
    value: formData.chatModel.model,
    type: 'custom',
    label: 'dialogue model',
    connected: true
  },
  {
    key: 'temperature',
    value: formData.chatModel.temperature,
    type: 'slider',
    label: 'temperature',
    connected: true
  },
  {
    key: 'maxToken',
    value: formData.chatModel.maxToken,
    type: 'custom',
    label: 'reply upper limit',
    connected: true
  },
  {
    key: 'systemPrompt',
    value: formData.chatModel.systemPrompt,
    type: 'textarea',
    label: 'system prompt word',
    connected: true
  },
  {
    key: 'limitPrompt',
    type: 'textarea',
    value: formData.chatModel.limitPrompt,
    label: 'qualifier',
    connected: true
  },
  {
    key: 'switch',
    type: 'target',
    label: 'trigger',
    connected: formData.kb.list.length > 0
  },
  {
    key: 'quoteQA',
    type: 'target',
    label: 'reference content',
    connected: formData.kb.list.length > 0
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
const welcomeTemplate = (formData: EditFormType): AppModuleItemType[] =>
  formData.guide?.welcome?.text
    ? [
        {
          name: 'User Guide',
          flowType: FlowModuleTypeEnum.userGuide,
          inputs: [
            {
              key: 'welcomeText',
              type: 'input',
              label: 'opening',
              value: formData.guide.welcome.text,
              connected: true
            }
          ],
          outputs: [],
          position: {
            x: 447.98520778293346,
            y: 721.4016845336229
          },
          moduleId: 'userGuide'
        }
      ]
    : [];
const variableTemplate = (formData: EditFormType): AppModuleItemType[] =>
  formData.variables.length > 0
    ? [
        {
          name: 'global variable',
          flowType: FlowModuleTypeEnum.variable,
          inputs: [
            {
              key: 'variables',
              value: formData.variables,
              type: 'systemInput',
              label: 'Variable input',
              connected: true
            }
          ],
          outputs: [],
          position: {
            x: 444.0369195277651,
            y: 1008.5185781784537
          },
          moduleId: 'variable'
        }
      ]
    : [];
const simpleChatTemplate = (formData: EditFormType): AppModuleItemType[] => [
  {
    name: 'User question (dialogue entry)',
    flowType: FlowModuleTypeEnum.questionInput,
    inputs: [
      {
        key: 'userChatInput',
        connected: true,
        label: 'User Question',
        type: 'target'
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
    name: 'Chat records',
    flowType: FlowModuleTypeEnum.historyNode,
    inputs: [
      {
        key: 'maxContext',
        value: 6,
        connected: true,
        type: 'numberInput',
        label: 'The longest record number'
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
    name: 'AI dialogue',
    flowType: FlowModuleTypeEnum.chatNode,
    inputs: chatModelInput(formData),
    showStatus: true,
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
    ],
    position: {
      x: 981.9682828103937,
      y: 890.014595014464
    },
    moduleId: 'chatModule'
  }
];
const kbTemplate = (formData: EditFormType): AppModuleItemType[] => [
  {
    name: 'User question (dialogue entry)',
    flowType: FlowModuleTypeEnum.questionInput,
    inputs: [
      {
        key: 'userChatInput',
        label: 'User Question',
        type: 'target',
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
    name: 'Chat records',
    flowType: FlowModuleTypeEnum.historyNode,
    inputs: [
      {
        key: 'maxContext',
        value: 6,
        connected: true,
        type: 'numberInput',
        label: 'The longest record number'
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
    name: 'Knowledge Base Search',
    flowType: FlowModuleTypeEnum.kbSearchNode,
    showStatus: true,
    inputs: [
      {
        key: 'kbList',
        value: formData.kb.list,
        type: FlowInputItemTypeEnum.custom,
        label: 'Associated knowledge base',
        connected: true
      },
      {
        key: 'similarity',
        value: formData.kb.searchSimilarity,
        type: FlowInputItemTypeEnum.slider,
        label: 'similarity',
        connected: true
      },
      {
        key: 'limit',
        value: formData.kb.searchLimit,
        type: FlowInputItemTypeEnum.slider,
        label: 'Single search limit',
        connected: true
      },
      {
        key: 'switch',
        type: FlowInputItemTypeEnum.target,
        label: 'trigger',
        connected: false
      },
      {
        key: 'userChatInput',
        type: FlowInputItemTypeEnum.target,
        label: 'User Question',
        connected: true
      }
    ],
    outputs: [
      {
        key: 'isEmpty',
        targets: formData.kb.searchEmptyText
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
  ...(formData.kb.searchEmptyText
    ? [
        {
          name: 'specified reply',
          flowType: FlowModuleTypeEnum.answerNode,
          inputs: [
            {
              key: 'switch',
              type: FlowInputItemTypeEnum.target,
              label: 'trigger',
              connected: true
            },
            {
              key: SpecialInputKeyEnum.answerText,
              value: formData.kb.searchEmptyText,
              type: FlowInputItemTypeEnum.textarea,
              valueType: FlowValueTypeEnum.string,
              label: 'reply content',
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
    name: 'AI dialogue',
    flowType: FlowModuleTypeEnum.chatNode,
    inputs: chatModelInput(formData),
    showStatus: true,
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
    ],
    position: {
      x: 1551.71405495818,
      y: 977.4911578918461
    },
    moduleId: 'chatModule'
  }
];

export const appForm2Modules = (formData: EditFormType) => {
  const modules = [
    ...welcomeTemplate(formData),
    ...variableTemplate(formData),
    ...(formData.kb.list.length > 0 ? kbTemplate(formData) : simpleChatTemplate(formData))
  ];

  return modules as AppModuleItemType[];
};
