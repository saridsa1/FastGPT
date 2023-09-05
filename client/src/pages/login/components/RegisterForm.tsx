import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Box, Input, Button, FormErrorMessage, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageTypeEnum } from '@/constants/user';
import { postRegister } from '@/api/user';
import { useSendCode } from '@/hooks/useSendCode';
import type { ResLogin } from '@/api/response/user';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/router';
import { postCreateApp } from '@/api/app';
import { appTemplates } from '@/constants/flow/ModuleTemplate';
import { feConfigs } from '@/store/static';

interface Props {
  loginSuccess: (e: ResLogin) => void;
  setPageType: Dispatch<`${PageTypeEnum}`>;
}

interface RegisterType {
  username: string;
  password: string;
  password2: string;
  code: string;
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<RegisterType>({
    mode: 'onBlur'
  });

  const { codeSending, sendCodeText, sendCode, codeCountDown } = useSendCode();

  const onclickSendCode = useCallback(async () => {
    const check = await trigger('username');
    if (!check) return;
    sendCode({
      username: getValues('username'),
      type: 'register'
    });
  }, [getValues, sendCode, trigger]);

  const [requesting, setRequesting] = useState(false);

  const onclickRegister = useCallback(
    async ({ username, password, code }: RegisterType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postRegister({
            username,
            code,
            password,
            inviterId: localStorage.getItem('inviterId') || undefined
          })
        );
        toast({
          title: `Registration successful`,
          status: 'success'
        });
        // auto register template app
        appTemplates.forEach((template) => {
          postCreateApp({
            avatar: template.avatar,
            name: template.name,
            modules: template.modules
          });
        });
      } catch (error: any) {
        toast({
          title: error.message || 'registration exception',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        Register {feConfigs?.systemTitle} account
      </Box>
      <form onSubmit={handleSubmit(onclickRegister)}>
        <FormControl mt={5} isInvalid={!!errors.username}>
          <Input
            placeholder="email/mobile phone number"
            size={['md', 'lg']}
            {...register('username', {
              required: 'Email/mobile phone number cannot be empty',
              pattern: {
                value:
                  /(^1[3456789]\d{9}$)|(^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$)/,
                message: 'email format error'
              }
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.username && errors.username.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.username}>
          <Flex>
            <Input
              flex={1}
              size={['md', 'lg']}
              placeholder="Verification Code"
              {...register('code', {
                required: 'Verification code cannot be empty'
              })}
            ></Input>
            <Button
              ml={5}
              w={'145px'}
              maxW={'50%'}
              size={['md', 'lg']}
              onClick={onclickSendCode}
              isDisabled={codeCountDown > 0}
              isLoading={codeSending}
            >
              {sendCodeText}
            </Button>
          </Flex>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.code && errors.code.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.password}>
          <Input
            type={'password'}
            placeholder="password"
            size={['md', 'lg']}
            {...register('password', {
              required: 'Password cannot be empty',
              minLength: {
                value: 4,
                message: 'Password must be at least 4 characters and at most 20 characters'
              },
              maxLength: {
                value: 20,
                message: 'Password must be at least 4 characters and at most 20 characters'
              }
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.password2}>
          <Input
            type={'password'}
            placeholder="confirm password"
            size={['md', 'lg']}
            {...register('password2', {
              validate: (val) =>
                getValues('password') === val ? true : 'The two passwords are inconsistent'
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.password2 && errors.password2.message}
          </FormErrorMessage>
        </FormControl>
        <Box
          float={'right'}
          fontSize="sm"
          mt={2}
          color={'myBlue.600'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => setPageType('login')}
        >
          Already have an account? Log in
        </Box>
        <Button
          type="submit"
          mt={5}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
        >
          Confirm registration
        </Button>
      </form>
    </>
  );
};

export default RegisterForm;
