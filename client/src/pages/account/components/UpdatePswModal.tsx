import React from 'react';
import { ModalBody, Box, Flex, Input, ModalFooter, Button } from '@chakra-ui/react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useRequest } from '@/hooks/useRequest';
import { updatePasswordByOld } from '@/api/user';

type FormType = {
  oldPsw: string;
  newPsw: string;
  confirmPsw: string;
};

const UpdatePswModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<FormType>({
    defaultValues: {
      oldPsw: '',
      newPsw: '',
      confirmPsw: ''
    }
  });

  const { mutate: onSubmit, isLoading } = useRequest({
    mutationFn: (data: FormType) => {
      if (data.newPsw !== data.confirmPsw) {
        return Promise.reject(t('commom. Password inconsistency'));
      }
      return updatePasswordByOld(data);
    },
    onSuccess() {
      onClose();
    },
    successToast: t('user. Update password succseful'),
    errorToast: t('user.Update password failed')
  });

  return (
    <MyModal isOpen onClose={onClose} title={t('user.Update Password')}>
      <ModalBody>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 70px'}>Old password:</Box>
          <Input flex={1} type={'password'} {...register('oldPsw', { required: true })}></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>New password:</Box>
          <Input
            flex={1}
            type={'password'}
            {...register('newPsw', {
              required: true,
              maxLength: {
                value: 20,
                message: 'Password must be at least 4 characters and at most 20 characters'
              }
            })}
          ></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 70px'}>Confirm password:</Box>
          <Input
            flex={1}
            type={'password'}
            {...register('confirmPsw', {
              required: true,
              maxLength: {
                value: 20,
                message: 'Password must be at least 4 characters and at most 20 characters'
              }
            })}
          ></Input>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button mr={3} variant={'base'} onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isLoading} onClick={handleSubmit((data) => onSubmit(data))}>
          confirm
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default UpdatePswModal;
