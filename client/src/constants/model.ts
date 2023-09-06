import type { ShareChatEditType } from '@/types/app';
import type { AppSchema } from '@/types/mongoSchema';

export const defaultApp: AppSchema = {
  _id: '',
  userId: 'userId',
  name: 'Model loading',
  type: 'basic',
  avatar: '/icon/logo.svg',
  intro: '',
  updateTime: Date.now(),
  share: {
    isShare: false,
    isShareDetail: false,
    collection: 0
  },
  modules: []
};

export const defaultShareChat: ShareChatEditType = {
  name: ''
};
