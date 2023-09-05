import React, { useState, useCallback } from 'react';
import { Box, Flex, Button, Textarea, IconButton, BoxProps } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { insertData2Kb, putKbDataById, delOneKbDataByDataId } from '@/api/plugins/kb';
import { getFileViewUrl } from '@/api/system';
import { useToast } from '@/hooks/useToast';
import { getErrText } from '@/utils/tools';
import MyIcon from '@/components/Icon';
import MyModal from '@/components/MyModal';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { useUserStore } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { DatasetItemType } from '@/types/plugin';
import { useTranslation } from 'react-i18next';

export type FormData = { dataId?: string } & DatasetItemType;

const InputDataModal = ({
  onClose,
  onSuccess,
  onDelete,
  kbId,
  defaultValues = {
    a: '',
    q: ''
  }
}: {
  onClose: () => void;
  onSuccess: (data: FormData) => void;
  onDelete?: () => void;
  kbId: string;
  defaultValues?: FormData;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { kbDetail, getKbDetail } = useUserStore();

  const { getValues, register, handleSubmit, reset } = useForm<FormData>({
    defaultValues
  });

  const maxToken = kbDetail.vectorModel?.maxToken || 2000;

  /**
   * Confirm import of new data
   */
  const sureImportData = useCallback(
    async (e: FormData) => {
      if (e.q.length >= maxToken) {
        toast({
          title: 'The total length is too long',
          status: 'warning'
        });
        return;
      }
      setLoading(true);

      try {
        const data = {
          dataId: '',
          a: e.a,
          q: e.q,
          source: 'Manual entry'
        };
        data.dataId = await insertData2Kb({
          kbId,
          data
        });

        toast({
          title: 'Importing data successfully, it will take some time to train',
          status: 'success'
        });
        reset({
          a: '',
          q: ''
        });

        onSuccess(data);
      } catch (err: any) {
        toast({
          title: getErrText(err, 'Something unexpected happened~'),
          status: 'error'
        });
      }
      setLoading(false);
    },
    [kbId, maxToken, onSuccess, reset, toast]
  );

  const updateData = useCallback(
    async (e: FormData) => {
      if (!e.dataId) return;

      if (e.a !== defaultValues.a || e.q !== defaultValues.q) {
        setLoading(true);
        try {
          const data = {
            dataId: e.dataId,
            kbId,
            a: e.a,
            q: e.q === defaultValues.q ? '' : e.q
          };
          await putKbDataById(data);
          onSuccess(data);
        } catch (err) {
          toast({
            status: 'error',
            title: getErrText(err, 'Failed to update data')
          });
        }
        setLoading(false);
      }

      toast({
        title: 'Data modified successfully',
        status: 'success'
      });
      onClose();
    },
    [defaultValues.a, defaultValues.q, kbId, onClose, onSuccess, toast]
  );

  useQuery(['getKbDetail'], () => {
    if (kbDetail._id === kbId) return null;
    return getKbDetail(kbId);
  });

  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      isCentered
      title={defaultValues.dataId ? 'Change data' : 'Manually import data'}
      w={'90vw'}
      maxW={'90vw'}
      h={'90vh'}
    >
      <Flex flexDirection={'column'} h={'100%'}>
        <Box
          display={'flex'}
          flexDirection={['column', 'row']}
          flex={'1 0 0'}
          h={['100%', 0]}
          overflow={'overlay'}
          px={6}
          pb={2}
        >
          <Box flex={1} mr={[0, 4]} mb={[4, 0]} h={['50%', '100%']}>
            <Flex>
              <Box h={'30px'}>{'Matching knowledge points'}</Box>
              <MyTooltip
                label={'The vectorized part is usually a question, or it can also be a statement'}
              >
                <QuestionOutlineIcon ml={1} />
              </MyTooltip>
            </Flex>
            <Textarea
              placeholder={`Matching knowledge points. This part of the content will be searched, please control the quality of the content, up to ${maxToken} words. `}
              maxLength={maxToken}
              resize={'none'}
              h={'calc(100% - 30px)'}
              {...register(`q`, {
                required: true
              })}
            />
          </Box>
          <Box flex={1} h={['50%', '100%']}>
            <Flex>
              <Box h={'30px'}>{'Expected answer'}</Box>
              <MyTooltip
                label={
                  'After the matching knowledge point is hit, this part of the content will be injected into the model together with the matching knowledge point to guide the model to answer'
                }
              >
                <QuestionOutlineIcon ml={1} />
              </MyTooltip>
            </Flex>
            <Textarea
              placeholder={
                ' Expected answer. This part of the content will not be searched, but will be supplemented as content of "matching knowledge points", usually answers to questions. A total of up to 3000 words. '
              }
              maxLength={3000}
              resize={'none'}
              h={'calc(100% - 30px)'}
              {...register('a')}
            />
          </Box>
        </Box>

        <Flex px={6} pt={['34px', 2]} pb={4} alignItems={'center'} position={'relative'}>
          <RawFileText
            fileId={getValues('file_id')}
            filename={getValues('source')}
            position={'absolute'}
            left={'50%'}
            top={['16px', '50%']}
            transform={'translate(-50%,-50%)'}
          />

          <Box flex={1}>
            {defaultValues.dataId && onDelete && (
              <IconButton
                variant={'outline'}
                icon={<MyIcon name={'delete'} w={'16px'} h={'16px'} />}
                aria-label={''}
                isLoading={loading}
                size={'sm'}
                _hover={{
                  color: 'red.600',
                  borderColor: 'red.600'
                }}
                onClick={async () => {
                  if (!onDelete || !defaultValues.dataId) return;
                  try {
                    await delOneKbDataByDataId(defaultValues.dataId);
                    onDelete();
                    onClose();
                    toast({
                      status: 'success',
                      title: 'Record deleted'
                    });
                  } catch (error) {
                    toast({
                      status: 'warning',
                      title: getErrText(error)
                    });
                    console.log(error);
                  }
                }}
              />
            )}
          </Box>
          <Box>
            <Button variant={'base'} mr={3} isLoading={loading} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={loading}
              onClick={handleSubmit(defaultValues.dataId ? updateData : sureImportData)}
            >
              {defaultValues.dataId ? 'Confirm Change' : 'Confirm Import'}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </MyModal>
  );
};

export default InputDataModal;

interface RawFileTextProps extends BoxProps {
  filename?: string;
  fileId?: string;
}
export function RawFileText({ fileId, filename = '', ...props }: RawFileTextProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  return (
    <MyTooltip label={fileId ? t('file.Click to view file') || '' : ''} shouldWrapChildren={false}>
      <Box
        color={'myGray.600'}
        display={'inline-block'}
        {...(!!fileId
          ? {
              cursor: 'pointer',
              textDecoration: ['underline', 'none'],
              _hover: {
                textDecoration: 'underline'
              },
              onClick: async () => {
                try {
                  const url = await getFileViewUrl(fileId);
                  const asPath = `${location.origin}${url}`;
                  window.open(asPath, '_blank');
                } catch (error) {
                  toast({
                    title: getErrText(error, 'Failed to get file address'),
                    status: 'error'
                  });
                }
              }
            }
          : {})}
        {...props}
      >
        {filename}
      </Box>
    </MyTooltip>
  );
}
