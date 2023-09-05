import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Flex, Input, Button, FormErrorMessage, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { PageTypeEnum } from '@/constants/user';
import { postLogin } from '@/api/user';
import type { ResLogin } from '@/api/response/user';
import { useToast } from '@/hooks/useToast';
import { feConfigs } from '@/store/static';
import { useGlobalStore } from '@/store/global';
import MyIcon from '@/components/Icon';

interface Props {
  setPageType: Dispatch<`${PageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const router = useRouter();
  const { lastRoute = '/app/list' } = router.query as { lastRoute: string };
  const { toast } = useToast();
  const { setLoginStore } = useGlobalStore();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  const onclickLogin = useCallback(
    async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postLogin({
            username,
            password
          })
        );
        toast({
          title: 'Login successful',
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || 'Login exception',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );

  const onclickGit = useCallback(() => {
    setLoginStore({
      provider: 'git',
      lastRoute
    });
    router.replace(
      `https://github.com/login/oauth/authorize?client_id=${
        feConfigs?.gitLoginKey
      }&redirect_uri=${`${location.origin}/login/provider`}&scope=user:email%20read:user`,
      '_self'
    );
  }, [lastRoute, setLoginStore]);

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        Login {feConfigs?.systemTitle}
      </Box>
      <form onSubmit={handleSubmit(onclickLogin)}>
        <FormControl mt={8} isInvalid={!!errors.username}>
          <Input
            placeholder="email/mobile phone number/user name"
            size={['md', 'lg']}
            {...register('username', {
              required: 'Email/mobile phone number/user name cannot be empty'
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.username && errors.username.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.password}>
          <Input
            type={'password'}
            size={['md', 'lg']}
            placeholder="password"
            {...register('password', {
              required: 'Password cannot be empty',
              maxLength: {
                value: 20,
                message: 'Password must be up to 20 characters'
              }
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>
        {feConfigs?.show_register && (
          <Flex align={'center'} justifyContent={'space-between'} mt={3} color={'myBlue.600'}>
            <Box
              cursor={'pointer'}
              _hover={{ textDecoration: 'underline' }}
              onClick={() => setPageType('forgetPassword')}
              fontSize="sm"
            >
              forget the password?
            </Box>
            <Box
              cursor={'pointer'}
              _hover={{ textDecoration: 'underline' }}
              onClick={() => setPageType('register')}
              fontSize="sm"
            >
              Register an account
            </Box>
          </Flex>
        )}
        <Button
          type="submit"
          mt={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
        >
          Log in
        </Button>
        {feConfigs?.show_register && (
          <>
            <Flex mt={10} justifyContent={'center'} alignItems={'center'}>
              <MyIcon
                name="gitFill"
                w={'34px'}
                cursor={'pointer'}
                color={'myGray.800'}
                onClick={onclickGit}
              />
            </Flex>
          </>
        )}
      </form>
    </>
  );
};

export default LoginForm;
