import { GET, POST, DELETE, PUT } from './request';
import type { ChatHistoryItemType } from '@/types/chat';
import type { InitChatResponse, InitShareChatResponse } from './response/chat';
import { RequestPaging } from '../types/index';
import type { OutLinkSchema } from '@/types/mongoSchema';
import type { ShareChatEditType } from '@/types/app';
import type { Props as UpdateHistoryProps } from '@/pages/api/chat/history/updateChatHistory';
import { AdminUpdateFeedbackParams } from './request/chat';

/**
 * Get initial chat content
 */
export const getInitChatSiteInfo = (data: { appId: string; chatId?: string }) =>
  GET<InitChatResponse>(`/chat/init`, data);

/**
 * get history
 */
export const getChatHistory = (data: RequestPaging & { appId?: string }) =>
  POST<ChatHistoryItemType[]>('/chat/history/getHistory', data);

/**
 * Delete a historical record
 */
export const delChatHistoryById = (chatId: string) => DELETE(`/chat/removeHistory`, { chatId });
/**
 * clear all history by appid
 */
export const clearChatHistoryByAppId = (appId: string) => DELETE(`/chat/removeHistory`, { appId });

/**
 * Delete a sentence of dialogue
 */
export const delChatRecordById = (data: { chatId: string; contentId: string }) =>
  DELETE(`/chat/delChatRecordByContentId`, data);

/**
 * Modify history: Title/Top
 */
export const putChatHistory = (data: UpdateHistoryProps) =>
  PUT('/chat/history/updateChatHistory', data);

/**
 * Initialize sharing chat
 */
export const initShareChatInfo = (data: { shareId: string }) =>
  GET<InitShareChatResponse>(`/chat/shareChat/init`, data);

/**
 * create a shareChat
 */
export const createShareChat = (
  data: ShareChatEditType & {
    appId: string;
  }
) => POST<string>(`/chat/shareChat/create`, data);

/**
 * get shareChat
 */
export const getShareChatList = (appId: string) =>
  GET<OutLinkSchema[]>(`/chat/shareChat/list`, { appId });

/**
 * delete a shareChat
 */
export const delShareChatById = (id: string) => DELETE(`/chat/shareChat/delete?id=${id}`);

export const userUpdateChatFeedback = (data: { chatItemId: string; userFeedback?: string }) =>
  POST('/chat/feedback/userUpdate', data);

export const adminUpdateChatFeedback = (data: AdminUpdateFeedbackParams) =>
  POST('/chat/feedback/adminUpdate', data);
