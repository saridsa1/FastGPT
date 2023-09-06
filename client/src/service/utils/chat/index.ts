import { ChatItemType } from '@/types/chat';
import { modelToolMap } from '@/utils/plugin';
import { ChatRoleEnum } from '@/constants/chat';
import type { NextApiResponse } from 'next';

export type ChatCompletionResponseType = {
  streamResponse: any;
  responseMessages: ChatItemType[];
  responseText: string;
  totalTokens: number;
};
export type StreamResponseType = {
  chatResponse: any;
  prompts: ChatItemType[];
  res: NextApiResponse;
  model: string;
  [key: string]: any;
};

/* slice chat context by tokens */
export const ChatContextFilter = ({
  model,
  prompts = [],
  maxTokens
}: {
  model: string;
  prompts: ChatItemType[];
  maxTokens: number;
}) => {
  if (!Array.isArray(prompts)) {
    return [];
  }
  const rawTextLen = prompts.reduce((sum, item) => sum + item.value.length, 0);

  // If the text length is less than half of the maximum token, no calculation is required
  if (rawTextLen < maxTokens * 0.5) {
    return prompts;
  }

  // filter startWith system prompt
  const chatStartIndex = prompts.findIndex((item) => item.obj !== ChatRoleEnum.System);
  const systemPrompts: ChatItemType[] = prompts.slice(0, chatStartIndex);
  const chatPrompts: ChatItemType[] = prompts.slice(chatStartIndex);

  // reduce  token of systemPrompt
  maxTokens -= modelToolMap.countTokens({
    messages: systemPrompts
  });

  //Truncate content based on tokens
  const chats: ChatItemType[] = [];

  // Capture the conversation content from back to front
  for (let i = chatPrompts.length - 1; i >= 0; i--) {
    chats.unshift(chatPrompts[i]);

    const tokens = modelToolMap.countTokens({
      messages: chats
    });

    /* The overall tokens are out of range and the system must retain them */
    if (tokens >= maxTokens) {
      chats.shift();
      break;
    }
  }

  return [...systemPrompts, ...chats];
};
