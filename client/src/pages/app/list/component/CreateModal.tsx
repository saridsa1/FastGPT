import React, { useCallback, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  Grid,
  useTheme,
  Card
} from '@chakra-ui/react';
import { useSelectFile } from '@/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImg } from '@/utils/file';
import { getErrText } from '@/utils/tools';
import { useToast } from '@/hooks/useToast';
import { postCreateApp } from '@/api/app';
import { useRouter } from 'next/router';
import { appTemplates } from '@/constants/flow/ModuleTemplate';
import { useGlobalStore } from '@/store/global';
import { useRequest } from '@/hooks/useRequest';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';

type FormType = {
  avatar: string;
  name: string;
  templateId: string;
};

const CreateModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const theme = useTheme();
  const { isPc } = useGlobalStore();
  const { register, setValue, getValues, handleSubmit } = useForm<FormType>({
    defaultValues: {
      avatar: '/icon/logo.svg',
      name: '',
      templateId: appTemplates[0].id
    }
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

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

  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (data: FormType) => {
      return postCreateApp({
        avatar: data.avatar,
        name: data.name,
        modules: appTemplates.find((item) => item.id === data.templateId)?.modules || []
      });
    },
    onSuccess(id: string) {
      router.push(`/app/detail?appId=${id}`);
      onSuccess();
      onClose();
    },
    successToast: 'Created successfully',
    errorToast: 'Create application exception'
  });

  return (
    <MyModal isOpen onClose={onClose} isCentered={!isPc}>
      <ModalHeader fontSize={'2xl'}>Create your own AI application</ModalHeader>
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          Choose a resounding name
        </Box>
        <Flex mt={3} alignItems={'center'}>
          <MyTooltip label={'Click to set avatar'}>
            <Avatar
              flexShrink={0}
              src={getValues('avatar')}
              w={['28px', '32px']}
              h={['28px', '32px']}
              cursor={'pointer'}
              borderRadius={'md'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
          <Input
            flex={1}
            ml={4}
            autoFocus
            bg={'myWhite.600'}
            {...register('name', {
              required: 'Application name cannot be empty~'
            })}
          />
        </Flex>
        <Box mt={[4, 7]} mb={[0, 3]} color={'myGray.800'} fontWeight={'bold'}>
          Choose from templates
        </Box>
        <Grid
          userSelect={'none'}
          gridTemplateColumns={['repeat(1,1fr)', 'repeat(2,1fr)']}
          gridGap={[2, 4]}
        >
          {appTemplates.map((item) => (
            <Card
              key={item.id}
              border={theme.borders.base}
              p={3}
              borderRadius={'md'}
              cursor={'pointer'}
              boxShadow={'sm'}
              {...(getValues('templateId') === item.id
                ? {
                    bg: 'myWhite.600'
                  }
                : {
                    _hover: {
                      boxShadow: 'md'
                    }
                  })}
              onClick={() => {
                setValue('templateId', item.id);
                setRefresh((state) => !state);
              }}
            >
              <Flex alignItems={'center'}>
                <Avatar src={item.avatar} borderRadius={'md'} w={'20px'} />
                <Box ml={3} fontWeight={'bold'}>
                  {item.name}
                </Box>
              </Flex>
              <Box fontSize={'sm'} mt={4}>
                {item.intro}
              </Box>
            </Card>
          ))}
        </Grid>
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} mr={3} onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={creating} onClick={handleSubmit((data) => onclickCreate(data))}>
          Confirm creation
        </Button>
      </ModalFooter>

      <File onSelect={onSelectFile} />
    </MyModal>
  );
};

export default CreateModal;
