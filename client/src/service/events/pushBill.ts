import { connectToDatabase, Bill, User, OutLink } from '../mongo';
import { BillSourceEnum } from '@/constants/user';
import { getModel } from '../utils/data';
import { ChatHistoryItemResType } from '@/types/chat';
import { formatPrice } from '@/utils/user';
import { addLog } from '../utils/tools';

export const pushTaskBill = async ({
  appName,
  appId,
  userId,
  source,
  shareId,
  response
}: {
  appName: string;
  appId: string;
  userId: string;
  source: `${BillSourceEnum}`;
  shareId?: string;
  response: ChatHistoryItemResType[];
}) => {
  const total = response.reduce((sum, item) => sum + item.price, 0);

  await Promise.allSettled([
    Bill.create({
      userId,
      appName,
      appId,
      total,
      source,
      list: response.map((item) => ({
        moduleName: item.moduleName,
        amount: item.price || 0,
        model: item.model,
        tokenLen: item.tokens
      }))
    }),
    User.findByIdAndUpdate(userId, {
      $inc: { balance: -total }
    }),
    ...(shareId
      ? [
          updateShareChatBill({
            shareId,
            total
          })
        ]
      : [])
  ]);

  addLog.info(`finish completions`, {
    source,
    userId,
    price: formatPrice(total)
  });
};

export const updateShareChatBill = async ({
  shareId,
  total
}: {
  shareId: string;
  total: number;
}) => {
  try {
    await OutLink.findOneAndUpdate(
      { shareId },
      {
        $inc: { total },
        lastTime: new Date()
      }
    );
  } catch (err) {
    addLog.error('update shareChat error', err);
  }
};

export const pushQABill = async ({
  userId,
  totalTokens,
  appName
}: {
  userId: string;
  totalTokens: number;
  appName: string;
}) => {
  addLog.info('splitData generate success', { totalTokens });

  let billId;

  try {
    await connectToDatabase();

    // Get the model price, which is split using gpt35
    const unitPrice = global.qaModel.price || 3;
    // Calculate the price
    const total = unitPrice * totalTokens;

    // Insert Bill record
    const res = await Bill.create({
      userId,
      appName,
      tokenLen: totalTokens,
      total
    });
    billId = res._id;

    // Account deduction
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -total }
    });
  } catch (err) {
    addLog.error('Create completions bill error', err);
    billId && Bill.findByIdAndDelete(billId);
  }
};

export const pushGenerateVectorBill = async ({
  userId,
  tokenLen,
  model
}: {
  userId: string;
  tokenLen: number;
  model: string;
}) => {
  let billId;

  try {
    await connectToDatabase();

    try {
      // Calculate price. At least 1
      const vectorModel =
        global.vectorModels.find((item) => item.model === model) || global.vectorModels[0];
      const unitPrice = vectorModel.price || 0.2;
      let total = unitPrice * tokenLen;
      total = total > 1 ? total : 1;

      // Insert Bill record
      const res = await Bill.create({
        userId,
        model: vectorModel.model,
        appName: 'Index Generation',
        total,
        list: [
          {
            moduleName: 'index generation',
            amount: total,
            model: vectorModel.model,
            tokenLen
          }
        ]
      });
      billId = res._id;

      // Account deduction
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: -total }
      });
    } catch (err) {
      addLog.error('Create generateVector bill error', err);
      billId && Bill.findByIdAndDelete(billId);
    }
  } catch (error) {
    console.log(error);
  }
};

export const countModelPrice = ({ model, tokens }: { model: string; tokens: number }) => {
  const modelData = getModel(model);
  if (!modelData) return 0;
  return modelData.price * tokens;
};
