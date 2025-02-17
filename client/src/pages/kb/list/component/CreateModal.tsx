import React, { useCallback, useState, useRef } from 'react';
import { Box, Flex, Button, ModalHeader, ModalFooter, ModalBody, Input } from '@chakra-ui/react';
import { useSelectFile } from '@/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImg } from '@/utils/file';
import { getErrText } from '@/utils/tools';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/router';
import { useGlobalStore } from '@/store/global';
import { useRequest } from '@/hooks/useRequest';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';
import { postCreateKb } from '@/api/plugins/kb';
import type { CreateKbParams } from '@/api/request/kb';
import { vectorModelList } from '@/store/static';
import MySelect from '@/components/Select';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import Tag from '@/components/Tag';

const CreateModal = ({ onClose }: { onClose: () => void }) => {
  const [refresh, setRefresh] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useGlobalStore();
  const { register, setValue, getValues, handleSubmit } = useForm<CreateKbParams>({
    defaultValues: {
      avatar: '/icon/logo.svg',
      name: '',
      tags: [],
      vectorModel: vectorModelList[0].model
    }
  });
  const InputRef = useRef<HTMLInputElement>(null);

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

  /* create a new kb and router to it */
  const { mutate: onclickCreate, isLoading: creating } = useRequest({
    mutationFn: async (data: CreateKbParams) => {
      const id = await postCreateKb(data);
      return id;
    },
    successToast: 'Created successfully',
    errorToast: 'An accident occurred while creating the knowledge base',
    onSuccess(id) {
      router.push(`/kb/detail?kbId=${id}`);
    }
  });

  return (
    <MyModal isOpen onClose={onClose} isCentered={!isPc} w={'400px'}>
      <ModalHeader fontSize={'2xl'}>Create a knowledge base</ModalHeader>
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          take a name
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
            ml={3}
            flex={1}
            autoFocus
            bg={'myWhite.600'}
            {...register('name', {
              required: 'Knowledge base name cannot be empty~'
            })}
          />
        </Flex>
        <Flex mt={6} alignItems={'center'}>
          <Box flex={'0 0 80px'}>Index model</Box>
          <Box flex={1}>
            <MySelect
              w={'100%'}
              value={getValues('vectorModel')}
              list={vectorModelList.map((item) => ({
                label: item.name,
                value: item.model
              }))}
              onchange={(e) => {
                setValue('vectorModel', e);
                setRefresh((state) => !state);
              }}
            />
          </Box>
        </Flex>
        <Flex mt={6} alignItems={'center'} w={'100%'}>
          <Box flex={'0 0 80px'}>
            Label
            <MyTooltip label={'Separate multiple labels with spaces for easy search'} forceShow>
              <QuestionOutlineIcon ml={1} />
            </MyTooltip>
          </Box>
          <Input
            flex={1}
            ref={InputRef}
            placeholder={' label, separated by spaces. '}
            maxLength={30}
            onChange={(e) => {
              setValue('tags', e.target.value.split(' '));
              setRefresh(!refresh);
            }}
          />
        </Flex>
        <Flex mt={2} flexWrap={'wrap'}>
          {getValues('tags')
            .filter((item) => item)
            .map((item, i) => (
              <Tag mr={2} mb={2} key={i} whiteSpace={'nowrap'}>
                {item}
              </Tag>
            ))}
        </Flex>
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
