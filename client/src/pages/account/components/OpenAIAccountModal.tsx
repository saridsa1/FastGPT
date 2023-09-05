import React from 'react';
import { ModalBody, Box, Flex, Input, ModalFooter, Button } from '@chakra-ui/react';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useRequest } from '@/hooks/useRequest';
import { UserType } from '@/types/user';

const OpenAIAccountModal = ({
  defaultData,
  onSuccess,
  onClose
}: {
  defaultData: UserType['openaiAccount'];
  onSuccess: (e: UserType['openaiAccount']) => Promise<any>;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm({
    defaultValues: defaultData
  });

  const { mutate: onSubmit, isLoading } = useRequest({
    mutationFn: async (data: UserType['openaiAccount']) => onSuccess(data),
    onSuccess(res) {
      onClose();
    },
    errorToast: t('user.Set OpenAI Account Failed')
  });

  return (
    <MyModal isOpen onClose={onClose} title={t('user.OpenAI Account Setting')}>
      <ModalBody>
        <Box fontSize={'sm'} color={'myGray.500'}>
          If you fill in this content, there will be no billing for using the OpenAI Chat model on
          the online platform (excluding knowledge base training and index generation)
        </Box>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 65px'}>API Key:</Box>
          <Input flex={1} {...register('key')}></Input>
        </Flex>
        <Flex alignItems={'center'} mt={5}>
          <Box flex={'0 0 65px'}>BaseUrl:</Box>
          <Input
            flex={1}
            {...register('baseUrl')}
            placeholder={
              'Request address, the default is openai official. The forwarding address can be filled in, but v1 is not automatically completed.'
            }
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

export default OpenAIAccountModal;
