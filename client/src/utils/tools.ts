import crypto from 'crypto';
import { useToast } from '@/hooks/useToast';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

/**
 * copy text data
 */
export const useCopyData = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return {
    copyData: async (
      data: string,
      title: string | null = t('common.Copy Successful'),
      duration = 1000
    ) => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(data);
        } else {
          throw new Error('');
        }
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = data;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      toast({
        title,
        status: 'success',
        duration
      });
    }
  };
};

/**
 * Password encryption
 */
export const createHashPassword = (text: string) => {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  return hash;
};

/**
 * Convert the object into query string
 */
export const Obj2Query = (obj: Record<string, string | number>) => {
  const queryParams = new URLSearchParams();
  for (const key in obj) {
    queryParams.append(key, `${obj[key]}`);
  }
  return queryParams.toString();
};

export const parseQueryString = (str: string) => {
  const queryObject: Record<string, any> = {};

  const splitStr = str.split('?');

  str = splitStr[1] || splitStr[0];

  // Split the string into an array of key-value pairs according to '&'
  const keyValuePairs = str.split('&');

  // Traverse the array of key-value pairs and parse each key-value pair into the attributes and values ​​of the object
  keyValuePairs.forEach(function (keyValuePair) {
    const pair = keyValuePair.split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');

    // If the property already exists in the object, convert the value to an array
    if (queryObject.hasOwnProperty(key)) {
      if (!Array.isArray(queryObject[key])) {
        queryObject[key] = [queryObject[key]];
      }
      queryObject[key].push(value);
    } else {
      queryObject[key] = value;
    }
  });

  return queryObject;
};

/**
 * Format time into chat format
 */
export const formatTimeToChatTime = (time: Date) => {
  const now = dayjs();
  const target = dayjs(time);

  // If the incoming time is less than 60 seconds, return just
  if (now.diff(target, 'second') < 60) {
    return 'Just now';
  }

  // If the time is today, display the time: a few seconds
  if (now.isSame(target, 'day')) {
    return target.format('HH:mm');
  }

  // If it is yesterday, display yesterday
  if (now.subtract(1, 'day').isSame(target, 'day')) {
    return 'yesterday';
  }

  // If it is the day before yesterday, display the day before yesterday
  if (now.subtract(2, 'day').isSame(target, 'day')) {
    return 'the day before yesterday';
  }

  // If it is this year, display a certain month and a certain day
  if (now.isSame(target, 'year')) {
    return target.format('M month D day');
  }

  // If it is longer ago, display a certain year, a certain month and a certain day
  return target.format('YYYY/M/D');
};

export const hasVoiceApi = typeof window !== 'undefined' && 'speechSynthesis' in window;
/**
 * voice broadcast
 */
export const voiceBroadcast = ({ text }: { text: string }) => {
  window.speechSynthesis?.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis?.getVoices?.(); // Get language pack
  const voice = voices.find((item) => {
    return item.name === 'Microsoft Yaoyao - Chinese (Simplified, PRC)';
  });
  if (voice) {
    msg.voice = voice;
  }

  window.speechSynthesis?.speak(msg);

  msg.onerror = (e) => {
    console.log(e);
  };

  return {
    cancel: () => window.speechSynthesis?.cancel()
  };
};
export const cancelBroadcast = () => {
  window.speechSynthesis?.cancel();
};

export const getErrText = (err: any, def = '') => {
  const msg: string = typeof err === 'string' ? err : err?.message || def || '';
  msg && console.log('error =>', msg);
  return msg;
};

export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, ms);
  });
