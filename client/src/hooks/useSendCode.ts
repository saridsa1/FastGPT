import { useState, useMemo, useCallback } from 'react';
import { sendAuthCode } from '@/api/user';
import { UserAuthTypeEnum } from '@/constants/common';
import { useToast } from './useToast';
import { feConfigs } from '@/store/static';
import { getErrText } from '@/utils/tools';

let timer: any;

export const useSendCode = () => {
  const { toast } = useToast();
  const [codeSending, setCodeSending] = useState(false);
  const [codeCountDown, setCodeCountDown] = useState(0);
  const sendCodeText = useMemo(() => {
    if (codeCountDown >= 10) {
      return `${codeCountDown}s after reacquisition`;
    }
    if (codeCountDown > 0) {
      return `0${codeCountDown}s after reacquisition`;
    }
    return 'get verification code';
  }, [codeCountDown]);

  const sendCode = useCallback(
    async ({ username, type }: { username: string; type: `${UserAuthTypeEnum}` }) => {
      setCodeSending(true);
      try {
        setCodeCountDown(10);
        timer = setInterval(() => {
          setCodeCountDown((val) => {
            if (val <= 0) {
              clearInterval(timer);
            }
            return val - 1;
          });
        }, 1000);
        toast({
          title: 'Verification code sent',
          status: 'success',
          position: 'top'
        });
      } catch (error: any) {
        toast({
          title: getErrText(error, 'Verification code sending exception'),
          status: 'error'
        });
      }
      setCodeSending(false);
    },
    [toast]
  );

  return {
    codeSending,
    sendCode,
    sendCodeText,
    codeCountDown
  };
};

export function getClientToken(googleClientVerKey?: string) {
  return new Promise<string>((resolve, reject) => {
    resolve('9949879837');
  });
}
