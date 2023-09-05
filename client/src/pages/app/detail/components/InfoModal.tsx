import React, { useState, useCallback } from 'react';
import {
  Box,
  Flex,
  Button,
  FormControl,
  Input,
  Textarea,
  ModalFooter,
  ModalBody
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AppSchema } from '@/types/mongoSchema';
import { useToast } from '@/hooks/useToast';
import { useSelectFile } from '@/hooks/useSelectFile';
import { compressImg } from '@/utils/file';
import { getErrText } from '@/utils/tools';
import { useUserStore } from '@/store/user';
import { useRequest } from '@/hooks/useRequest';
import Avatar from '@/components/Avatar';
import MyModal from '@/components/MyModal';

const InfoModal = ({
  defaultApp,
  onClose,
  onSuccess
}: {
  defaultApp: AppSchema;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { toast } = useToast();
  const { updateAppDetail } = useUserStore();

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    reset,
    handleSubmit
  } = useForm({
    defaultValues: defaultApp
  });
  const [refresh, setRefresh] = useState(false);

  //Submit and save model modifications
  const { mutate: saveSubmitSuccess, isLoading: btnLoading } = useRequest({
    mutationFn: async (data: AppSchema) => {
      await updateAppDetail(data._id, {
        name: data.name,
        avatar: data.avatar,
        intro: data.intro,
        chat: data.chat,
        share: data.share
      });
    },
    onSuccess() {
      onSuccess && onSuccess();
      onClose();
      toast({
        title: 'Update successful',
        status: 'success'
      });
    },
    errorToast: 'Update failed'
  });

  //Failed to submit and save form
  const saveSubmitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return 'Error submitting the form';
      if (!!obj.message) {
        return obj.message;
      }
      return deepSearch(Object.values(obj)[0]);
    };
    toast({
      title: deepSearch(errors),
      status: 'error',
      duration: 4000,
      isClosable: true
    });
  }, [errors, toast]);

  const saveUpdateModel = useCallback(
    () => handleSubmit((data) => saveSubmitSuccess(data), saveSubmitError)(),
    [handleSubmit, saveSubmitError, saveSubmitSuccess]
  );

  const onSelectFile = useCallback(
    async (e: File[]) => {
      const file = e[0];
      if (!file) return;
      try {
        const src = await compressImg({
          file,
          maxW: 100,
          maxH: 100
        });
        setValue('avatar', src);
        setRefresh((state) => !state);
      } catch (err: any) {
        toast({
          title: getErrText(err, 'Avatar selection exception'),
          status: 'warning'
        });
      }
    },
    [setValue, toast]
  );

  return (
    <MyModal isOpen={true} onClose={onClose} title={'App Information Settings'}>
      <ModalBody>
        <Box>Avatar & Name</Box>
        <Flex mt={2} alignItems={'center'}>
          <Avatar
            src={getValues('avatar')}
            w={['26px', '34px']}
            h={['26px', '34px']}
            cursor={'pointer'}
            borderRadius={'lg'}
            mr={4}
            title={'Click to switch avatar'}
            onClick={() => onOpenSelectFile()}
          />
          <FormControl>
            <Input
              bg={'myWhite.600'}
              placeholder={'Set a name for the application'}
              {...register('name', {
                required: 'The display name cannot be empty'
              })}
            ></Input>
          </FormControl>
        </Flex>
        <Box mt={7} mb={1}>
          Application introduction
        </Box>
        {/* <Box color={'myGray.500'} mb={2} fontSize={'sm'}>
            This introduction is mainly used for memory and display in the application market
          </Box> */}
        <Textarea
          rows={4}
          maxLength={500}
          placeholder={'Give an introduction to your AI application'}
          bg={'myWhite.600'}
          {...register('intro')}
        />
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} mr={3} onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={btnLoading} onClick={saveUpdateModel}>
          save
        </Button>
      </ModalFooter>

      <File onSelect={onSelectFile} />
    </MyModal>
  );
};

export default InfoModal;
