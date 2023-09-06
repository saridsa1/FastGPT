import { insertKbItem } from '@/service/pg';
import { getVector } from '@/pages/api/openapi/plugin/vector';
import { TrainingData } from '../models/trainingData';
import { ERROR_ENUM } from '../errorCode';
import { TrainingModeEnum } from '@/constants/plugin';
import { sendInform } from '@/pages/api/user/inform/send';
import { addLog } from '../utils/tools';

const reduceQueue = () => {
  global.vectorQueueLen = global.vectorQueueLen > 0 ? global.vectorQueueLen - 1 : 0;
};

/* Index generation queue. Each time it is imported, it is a separate thread */
export async function generateVector(): Promise<any> {
  if (global.vectorQueueLen >= global.systemEnv.vectorMaxProcess) return;
  global.vectorQueueLen++;

  let trainingId = '';
  let userId = '';
  let dataItems: {
    q: string;
    a: string;
  }[] = [];

  try {
    const data = await TrainingData.findOneAndUpdate(
      {
        mode: TrainingModeEnum.index,
        lockTime: { $lte: new Date(Date.now() - 1 * 60 * 1000) }
      },
      {
        lockTime: new Date()
      }
    ).select({
      _id: 1,
      userId: 1,
      kbId: 1,
      q: 1,
      a: 1,
      source: 1,
      file_id: 1,
      vectorModel: 1
    });

    //task preemption
    if (!data) {
      reduceQueue();
      global.vectorQueueLen <= 0 && console.log(`[Index] Task completed`);
      return;
    }

    trainingId = data._id;
    userId = String(data.userId);
    const kbId = String(data.kbId);

    dataItems = [
      {
        q: data.q.replace(/[\x00-\x08]/g, ' '),
        a: data.a.replace(/[\x00-\x08]/g, ' ')
      }
    ];

    // Generate word vectors
    const { vectors } = await getVector({
      model: data.vectorModel,
      input: dataItems.map((item) => item.q),
      userId
    });

    // Generate the result and insert it into pg
    await insertKbItem({
      userId,
      kbId,
      data: vectors.map((vector, i) => ({
        q: dataItems[i].q,
        a: dataItems[i].a,
        source: data.source,
        file_id: data.file_id,
        vector
      }))
    });

    // delete data from training
    await TrainingData.findByIdAndDelete(data._id);
    // console.log(`Vector generation successful: ${data._id}`);

    reduceQueue();
    generateVector();
  } catch (err: any) {
    reduceQueue();
    // log
    if (err?.response) {
      addLog.info('openai error: Generate vector error', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    } else {
      addLog.info('openai error: Generate vector error', {
        err
      });
    }

    // message error or openai account error
    if (
      err?.message === 'invalid message format' ||
      err.response?.data?.error?.type === 'invalid_request_error'
    ) {
      addLog.info('invalid message format', {
        dataItems
      });
      try {
        await TrainingData.findByIdAndUpdate(trainingId, {
          lockTime: new Date('2998/5/5')
        });
      } catch (error) {}
      return generateVector();
    }

    // err vector data
    if (err?.code === 500) {
      await TrainingData.findByIdAndDelete(trainingId);
      return generateVector();
    }

    // Account balance is insufficient, delete task
    if (userId && err === ERROR_ENUM.insufficientQuota) {
      try {
        sendInform({
          type: 'system',
          title: 'Index generation task aborted',
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
      } catch (error) {}
      return generateVector();
    }

    setTimeout(() => {
      generateVector();
    }, 1000);
  }
}
