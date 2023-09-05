import React, { useState } from 'react';
import { Box, Textarea, Button, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/useToast';
import { useRequest } from '@/hooks/useRequest';
import { getErrText } from '@/utils/tools';
import { postKbDataFromList } from '@/api/plugins/kb';
import { TrainingModeEnum } from '@/constants/plugin';
import { useUserStore } from '@/store/user';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

type ManualFormType = { q: string; a: string };

const ManualImport = ({ kbId }: { kbId: string }) => {
  const { kbDetail } = useUserStore();
  const maxToken = kbDetail.vectorModel?.maxToken || 2000;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { q: '', a: '' }
  });
  const { toast } = useToast();
  const [qLen, setQLen] = useState(0);

  const { mutate: onImportData, isLoading } = useRequest({
    mutationFn: async (e: ManualFormType) => {
      if (e.a.length + e.q.length >= 3000) {
        toast({
          title: 'The total length is too long',
          status: 'warning'
        });
        return;
      }

      try {
        const data = {
          a: e.a,
          q: e.q,
          source: 'Manual entry'
        };
        const { insertLen } = await postKbDataFromList({
          kbId,
          mode: TrainingModeEnum.index,
          data: [data]
        });

        if (insertLen === 0) {
          toast({
            title: 'Exactly consistent data already exists',
            status: 'warning'
          });
        } else {
          toast({
            title: 'Importing data successfully, it will take some time to train',
            status: 'success'
          });
          reset({
            a: '',
            q: ''
          });
        }
      } catch (err: any) {
        toast({
          title: getErrText(err, 'Something unexpected happened~'),
          status: 'error'
        });
      }
    }
  });

  return (
    <Box p={[4, 8]} h={'100%'} overflow={'overlay'}>
      <Box display={'flex'} flexDirection={['column', 'row']}>
        <Box flex={1} mr={[0, 4]} mb={[4, 0]} h={['50%', '100%']} position={'relative'}>
          <Flex>
            <Box h={'30px'}>{'Matching knowledge points'}</Box>
            <MyTooltip
              label={'The vectorized part is usually a question, or it can also be a statement'}
            >
              <QuestionOutlineIcon ml={1} />
            </MyTooltip>
          </Flex>
          <Textarea
            placeholder={`Matched knowledge points. This part of the content will be searched, please control the quality of the content. At most ${maxToken} characters. `}
            maxLength={maxToken}
            h={['250px', '500px']}
            {...register(`q`, {
              required: true,
              onChange(e) {
                setQLen(e.target.value.length);
              }
            })}
          />
          <Box position={'absolute'} color={'myGray.500'} right={5} bottom={3} zIndex={99}>
            {qLen}
          </Box>
        </Box>
        <Box flex={1} h={['50%', '100%']}>
          <Flex>
            <Box h={'30px'}>{'Expected Answer'}</Box>
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
              ' Expected answer. This part of the content will not be searched, but will be supplemented with "matching knowledge points", usually the answer to the question. A total of up to 3000 words. '
            }
            h={['250px', '500px']}
            maxLength={3000}
            {...register('a')}
          />
        </Box>
      </Box>
      <Button mt={5} isLoading={isLoading} onClick={handleSubmit((data) => onImportData(data))}>
        Confirm import
      </Button>
    </Box>
  );
};

export default React.memo(ManualImport);
