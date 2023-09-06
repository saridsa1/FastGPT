import { TrainingData } from '@/service/mongo';
import { pushQABill } from '@/service/events/pushBill';
import { pushDataToKb } from '@/pages/api/openapi/kb/pushData';
import { TrainingModeEnum } from '@/constants/plugin';
import { ERROR_ENUM } from '../errorCode';
import { sendInform } from '@/pages/api/user/inform/send';
import { authBalanceByUid } from '../utils/auth';
import { axiosConfig, getAIChatApi } from '../lib/openai';
import { ChatCompletionRequestMessage } from 'openai';
import { modelToolMap } from '@/utils/plugin';
import { gptMessage2ChatType } from '@/utils/adapt';
import { addLog } from '../utils/tools';

const reduceQueue = () => {
  global.qaQueueLen = global.qaQueueLen > 0 ? global.qaQueueLen - 1 : 0;
};

export async function generateQA(): Promise<any> {
  if (global.qaQueueLen >= global.systemEnv.qaMaxProcess) return;
  global.qaQueueLen++;

  let trainingId = '';
  let userId = '';

  try {
    const data = await TrainingData.findOneAndUpdate(
      {
        mode: TrainingModeEnum.qa,
        lockTime: { $lte: new Date(Date.now() - 4 * 60 * 1000) }
      },
      {
        lockTime: new Date()
      }
    ).select({
      _id: 1,
      userId: 1,
      kbId: 1,
      prompt: 1,
      q: 1,
      source: 1,
      file_id: 1
    });

    //task preemption
    if (!data) {
      reduceQueue();
      global.qaQueueLen <= 0 && console.log(`[QA] Task completed`);
      return;
    }

    trainingId = data._id;
    userId = String(data.userId);
    const kbId = String(data.kbId);

    await authBalanceByUid(userId);

    const startTime = Date.now();

    const chatAPI = getAIChatApi();

    // request chatgpt to get an answer
    const response = await Promise.all(
      [data.q].map((text) => {
        const modelTokenLimit = global.qaModel.maxToken || 16000;
        const messages: ChatCompletionRequestMessage[] = [
          {
            role: 'system',
            content: `I will send you a long text, ${
              data.prompt ? ` is ${data.prompt}, ` : ''
            }Please learn it and give 25 questions and answers in markdown format. The questions can be diversified and freely expanded; the answers must be detailed and well-interpreted. The answers include ordinary text, links, codes, tables, public announcements, media links, etc. Return according to the following QA question and answer format:
Q1:
A1:
Q2:
A2:
...`
          },
          {
            role: 'user',
            content: text
          }
        ];

        const promptsToken = modelToolMap.countTokens({
          messages: gptMessage2ChatType(messages)
        });
        const maxToken = modelTokenLimit - promptsToken;

        return chatAPI
          .createChatCompletion(
            {
              model: global.qaModel.model,
              temperature: 0.8,
              messages,
              stream: false,
              max_tokens: maxToken
            },
            {
              timeout: 480000,
              ...axiosConfig()
            }
          )
          .then((res) => {
            const answer = res.data.choices?.[0].message?.content;
            const totalTokens = res.data.usage?.total_tokens || 0;

            const result = formatSplitText(answer || ''); //Formatted QA pair
            console.log(`split result length: `, result.length);
            // billing
            if (result.length > 0) {
              pushQABill({
                userId: data.userId,
                totalTokens,
                appName: 'QA Split'
              });
            } else {
              addLog.info(`QA result 0:`, { answer });
            }

            return {
              rawContent: answer,
              result
            };
          })
          .catch((err) => {
            console.log('QA split error');
            console.log(err.response?.status, err.response?.statusText, err.response?.data);
            return Promise.reject(err);
          });
      })
    );

    const responseList = response.map((item) => item.result).flat();

    //Create vector generation queue
    await pushDataToKb({
      kbId,
      data: responseList.map((item) => ({
        ...item,
        source: data.source,
        file_id: data.file_id
      })),
      userId,
      mode: TrainingModeEnum.index
    });

    //delete data from training
    await TrainingData.findByIdAndDelete(data._id);

    console.log('Generate QA successfully, time:', `${(Date.now() - startTime) / 1000}s`);

    reduceQueue();
    generateQA();
  } catch (err: any) {
    reduceQueue();
    // log
    if (err?.response) {
      console.log('openai error: Generate QA error');
      console.log(err.response?.status, err.response?.statusText, err.response?.data);
    } else {
      console.log('Generating QA error:', err);
    }

    // message error or openai account error
    if (err?.message === 'invalid message format') {
      await TrainingData.findByIdAndRemove(trainingId);
    }

    // Insufficient account balance, delete the task
    if (userId && err === ERROR_ENUM.insufficientQuota) {
      sendInform({
        type: 'system',
        title: 'QA task aborted',
        content:
          'Due to insufficient account balance, the index generation task is suspended and will continue after recharging. Paused tasks will be deleted after 7 days. ',
        userId
      });
      console.log('Insufficient balance, suspending vector generation task');
      await TrainingData.updateMany(
        {
          userId
        },
        {
          lockTime: new Date('2999/5/5')
        }
      );
      return generateQA();
    }

    setTimeout(() => {
      generateQA();
    }, 1000);
  }
}

/**
 * Check if text is returned in format
 */
function formatSplitText(text: string) {
  const regex = /Q\d+:(\s*)(.*)(\s*)A\d+:(\s*)([\s\S]*?)(?=Q|$)/g; // Regular expression to match Q and A
  const matches = text.matchAll(regex); // Get all matching results

  const result = []; // store the final result
  for (const match of matches) {
    const q = match[2];
    const a = match[5];
    if (q && a) {
      // If both Q and A exist, add them to the result
      result.push({
        q,
        a: a.trim().replace(/\n\s*/g, '\n')
      });
    }
  }

  return result;
}
