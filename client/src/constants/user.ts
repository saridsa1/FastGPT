export enum BillSourceEnum {
  fastgpt = 'fastgpt',
  api = 'api',
  shareLink = 'shareLink'
}
export enum PageTypeEnum {
  login = 'login',
  register = 'register',
  forgetPassword = 'forgetPassword'
}

export const BillSourceMap: Record<`${BillSourceEnum}`, string> = {
  [BillSourceEnum.fastgpt]: 'FastGPT platform',
  [BillSourceEnum.api]: 'Api',
  [BillSourceEnum.shareLink]: 'No login link'
};

export enum PromotionEnum {
  register = 'register',
  pay = 'pay'
}

export enum InformTypeEnum {
  system = 'system'
}

export const InformTypeMap = {
  [InformTypeEnum.system]: {
    label: 'system notification'
  }
};

export enum MyModelsTypeEnum {
  my = 'my',
  collection = 'collection'
}
