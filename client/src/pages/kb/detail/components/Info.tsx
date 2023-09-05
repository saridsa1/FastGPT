import React, {
  useCallback,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardedRef
} from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Button, FormControl, IconButton, Input } from '@chakra-ui/react';
import { QuestionOutlineIcon, DeleteIcon } from '@chakra-ui/icons';
import { delKbById, putKbById } from '@/api/plugins/kb';
import { useSelectFile } from '@/hooks/useSelectFile';
import { useToast } from '@/hooks/useToast';
import { useUserStore } from '@/store/user';
import { useConfirm } from '@/hooks/useConfirm';
import { UseFormReturn } from 'react-hook-form';
import { compressImg } from '@/utils/file';
import type { KbItemType } from '@/types/plugin';
import Avatar from '@/components/Avatar';
import Tag from '@/components/Tag';
import MyTooltip from '@/components/MyTooltip';

export interface ComponentRef {
  initInput: (tags: string) => void;
}

const Info = (
  { kbId, form }: { kbId: string; form: UseFormReturn<KbItemType, any> },
  ref: ForwardedRef<ComponentRef>
) => {
  const { getValues, formState, setValue, register, handleSubmit } = form;
  const InputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();

  const [btnLoading, setBtnLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { openConfirm, ConfirmModal } = useConfirm({
    content: 'Confirm to delete this knowledge base? Data will not be recovered, please confirm! '
  });

  const { File, onOpen: onOpenSelectFile } = useSelectFile({
    fileType: '.jpg,.png',
    multiple: false
  });

  const { kbDetail, getKbDetail, loadKbList, myKbList } = useUserStore();

  /* Click to delete */
  const onclickDelKb = useCallback(async () => {
    setBtnLoading(true);
    try {
      await delKbById(kbId);
      toast({
        title: 'Delete successfully',
        status: 'success'
      });
      router.replace(`/kb/list`);
      await loadKbList();
    } catch (err: any) {
      toast({
        title: err?.message || 'Delete failed',
        status: 'error'
      });
    }
    setBtnLoading(false);
  }, [setBtnLoading, kbId, toast, router, loadKbList]);

  const saveSubmitSuccess = useCallback(
    async (data: KbItemType) => {
      setBtnLoading(true);
      try {
        await putKbById({
          id: kbId,
          ...data
        });
        await getKbDetail(kbId, true);
        toast({
          title: 'Update successful',
          status: 'success'
        });
        loadKbList();
      } catch (err: any) {
        toast({
          title: err?.message || 'Update failed',
          status: 'error'
        });
      }
      setBtnLoading(false);
    },
    [getKbDetail, kbId, loadKbList, toast]
  );
  const saveSubmitError = useCallback(() => {
    // deep search message
    const deepSearch = (obj: any): string => {
      if (!obj) return 'Error submitting form';
      if (!!obj.message) {
        return obj.message;
      }
      return deepSearch(Object.values(obj)[0]);
    };
    toast({
      title: deepSearch(formState.errors),
      status: 'error',
      duration: 4000,
      isClosable: true
    });
  }, [formState.errors, toast]);

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
          title: typeof err === 'string' ? err : 'Avatar selection exception',
          status: 'warning'
        });
      }
    },
    [setRefresh, setValue, toast]
  );

  useImperativeHandle(ref, () => ({
    initInput: (tags: string) => {
      if (InputRef.current) {
        InputRef.current.value = tags;
      }
    }
  }));

  return (
    <Box py={5} px={[5, 10]}>
      <Flex mt={5} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          Knowledge Base ID
        </Box>
        <Box flex={1}>{kbDetail._id}</Box>
      </Flex>
      <Flex mt={8} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          index model
        </Box>
        <Box flex={[1, '0 0 300px']}>{getValues('vectorModel').name}</Box>
      </Flex>
      <Flex mt={8} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          MaxTokens
        </Box>
        <Box flex={[1, '0 0 300px']}>{getValues('vectorModel').maxToken}</Box>
      </Flex>
      <Flex mt={5} w={'100%'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          Knowledge base avatar
        </Box>
        <Box flex={[1, '0 0 300px']}>
          <MyTooltip label={'Click to switch avatar'}>
            <Avatar
              m={'auto'}
              src={getValues('avatar')}
              w={['32px', '40px']}
              h={['32px', '40px']}
              cursor={'pointer'}
              onClick={onOpenSelectFile}
            />
          </MyTooltip>
        </Box>
      </Flex>
      <FormControl mt={8} w={'100%'} display={'flex'} alignItems={'center'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          Knowledge base name
        </Box>
        <Input
          flex={[1, '0 0 300px']}
          {...register('name', {
            required: 'Knowledge base name cannot be empty'
          })}
        />
      </FormControl>
      <Flex mt={8} alignItems={'center'} w={'100%'} flexWrap={'wrap'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}>
          Label
          <MyTooltip label={'Separate multiple labels with spaces for easy search'} forceShow>
            <QuestionOutlineIcon ml={1} />
          </MyTooltip>
        </Box>
        <Input
          flex={[1, '0 0 300px']}
          ref={InputRef}
          defaultValue={getValues('tags')}
          placeholder={' label, separated by spaces. '}
          maxLength={30}
          onChange={(e) => {
            setValue('tags', e.target.value);
            setRefresh(!refresh);
          }}
        />
        <Flex w={'100%'} pl={['90px', '160px']} mt={2}>
          {getValues('tags')
            .split(' ')
            .filter((item) => item)
            .map((item, i) => (
              <Tag mr={2} mb={2} key={i} whiteSpace={'nowrap'}>
                {item}
              </Tag>
            ))}
        </Flex>
      </Flex>
      <Flex mt={5} w={'100%'} alignItems={'flex-end'}>
        <Box flex={['0 0 90px', '0 0 160px']} w={0}></Box>
        <Button
          isLoading={btnLoading}
          mr={4}
          w={'100px'}
          onClick={handleSubmit(saveSubmitSuccess, saveSubmitError)}
        >
          save
        </Button>
        <IconButton
          isLoading={btnLoading}
          icon={<DeleteIcon />}
          aria-label={''}
          variant={'outline'}
          size={'sm'}
          _hover={{
            color: 'red.600',
            borderColor: 'red.600'
          }}
          onClick={openConfirm(onclickDelKb)}
        />
      </Flex>
      <File onSelect={onSelectFile} />
      <ConfirmModal />
    </Box>
  );
};

export default forwardRef(Info);
