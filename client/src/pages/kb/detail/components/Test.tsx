import React, { useEffect, useMemo, useState } from 'react';
import { Box, Textarea, Button, Flex, useTheme, Grid, Progress } from '@chakra-ui/react';
import { useKbStore } from '@/store/kb';
import type { KbTestItemType } from '@/types/plugin';
import { searchText, getKbDataItemById } from '@/api/plugins/kb';
import MyIcon from '@/components/Icon';
import { useRequest } from '@/hooks/useRequest';
import { formatTimeToChatTime } from '@/utils/tools';
import InputDataModal, { type FormData } from './InputDataModal';
import { useGlobalStore } from '@/store/global';
import { getErrText } from '@/utils/tools';
import { useToast } from '@/hooks/useToast';
import { customAlphabet } from 'nanoid';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { useUserStore } from '@/store/user';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 12);

const Test = ({ kbId }: { kbId: string }) => {
  const { kbDetail } = useUserStore();

  const theme = useTheme();
  const { toast } = useToast();
  const { setLoading } = useGlobalStore();
  const { kbTestList, pushKbTestItem, delKbTestItemById, updateKbItemById } = useKbStore();
  const [inputText, setInputText] = useState('');
  const [kbTestItem, setKbTestItem] = useState<KbTestItemType>();
  const [editData, setEditData] = useState<FormData>();

  const kbTestHistory = useMemo(
    () => kbTestList.filter((item) => item.kbId === kbId),
    [kbId, kbTestList]
  );

  const { mutate, isLoading } = useRequest({
    mutationFn: () => searchText({ kbId, text: inputText.trim() }),
    onSuccess(res) {
      const testItem = {
        id: nanoid(),
        kbId,
        text: inputText.trim(),
        time: new Date(),
        results: res
      };
      pushKbTestItem(testItem);
      setKbTestItem(testItem);
    },
    onError(err) {
      toast({
        title: getErrText(err),
        status: 'error'
      });
    }
  });

  useEffect(() => {
    setKbTestItem(undefined);
  }, [kbId]);

  return (
    <Box h={'100%'} display={['block', 'flex']}>
      <Box
        h={['auto', '100%']}
        display={['block', 'flex']}
        flexDirection={'column'}
        flex={1}
        maxW={'500px'}
        py={4}
        borderRight={['none', theme.borders.base]}
      >
        <Box border={'2px solid'} borderColor={'myBlue.600'} p={3} mx={4} borderRadius={'md'}>
          <Box fontSize={'sm'} fontWeight={'bold'}>
            <MyIcon mr={2} name={'text'} w={'18px'} h={'18px'} color={'myBlue.700'} />
            test text
          </Box>
          <Textarea
            rows={6}
            resize={'none'}
            variant={'unstyled'}
            maxLength={kbDetail.vectorModel.maxToken}
            placeholder="Enter the text to be tested"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <Flex alignItems={'center'} justifyContent={'flex-end'}>
            <Box mr={3} color={'myGray.500'}>
              {inputText.length}
            </Box>
            <Button isDisabled={inputText === ''} isLoading={isLoading} onClick={mutate}>
              test
            </Button>
          </Flex>
        </Box>
        <Box mt={5} flex={'1 0 0'} px={4} overflow={'overlay'} display={['none', 'block']}>
          <Flex alignItems={'center'} color={'myGray.600'}>
            <MyIcon mr={2} name={'history'} w={'16px'} h={'16px'} />
            <Box fontSize={'2xl'}>Test History</Box>
          </Flex>
          <Box mt={2}>
            <Flex py={2} fontWeight={'bold'} borderBottom={theme.borders.sm}>
              <Box flex={1}>Test Text</Box>
              <Box w={'80px'}>Time</Box>
              <Box w={'14px'}></Box>
            </Flex>
            {kbTestHistory.map((item) => (
              <Flex
                key={item.id}
                p={1}
                alignItems={'center'}
                borderBottom={theme.borders.base}
                _hover={{
                  bg: '#f4f4f4',
                  '&.delete': {
                    display: 'block'
                  }
                }}
                cursor={'pointer'}
                onClick={() => setKbTestItem(item)}
              >
                <Box flex={1} mr={2}>
                  {item.text}
                </Box>
                <Box w={'80px'}>{formatTimeToChatTime(item.time)}</Box>
                <MyTooltip label={'Delete this test record'}>
                  <Box w={'14px'} h={'14px'}>
                    <MyIcon
                      className="delete"
                      name={'delete'}
                      w={'14px'}
                      display={'none'}
                      _hover={{ color: 'red.600' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        delKbTestItemById(item.id);
                        kbTestItem?.id === item.id && setKbTestItem(undefined);
                      }}
                    />
                  </Box>
                </MyTooltip>
              </Flex>
            ))}
          </Box>
        </Box>
      </Box>
      <Box p={4} h={['auto', '100%']} overflow={'overlay'} flex={1}>
        {!kbTestItem?.results || kbTestItem.results.length === 0 ? (
          <Flex
            mt={[10, 0]}
            h={'100%'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <MyIcon name={'empty'} color={'transparent'} w={'54px'} />
            <Box mt={3} color={'myGray.600'}>
              Test results will be shown here
            </Box>
          </Flex>
        ) : (
          <>
            <Flex alignItems={'flex-end'}>
              <Box fontSize={'3xl'} color={'myGray.600'}>
                Test Results
              </Box>
              <MyTooltip
                label={
                  'Sort according to the similarity between the content of the knowledge base and the test text, and you can adjust the corresponding text according to the test results. \nNote: The data in the test record may have been modified, and the latest data will be displayed after clicking on a piece of test data. '
                }
                forceShow
              >
                <QuestionOutlineIcon
                  ml={2}
                  color={'myGray.600'}
                  cursor={'pointer'}
                  fontSize={'lg'}
                />
              </MyTooltip>
            </Flex>
            <Grid
              mt={1}
              gridTemplateColumns={[
                'repeat(1,1fr)',
                'repeat(1,1fr)',
                'repeat(1,1fr)',
                'repeat(1,1fr)',
                'repeat(2,1fr)'
              ]}
              gridGap={4}
            >
              {kbTestItem?.results.map((item) => (
                <Box
                  key={item.id}
                  pb={2}
                  borderRadius={'sm'}
                  border={theme.borders.base}
                  _notLast={{ mb: 2 }}
                  cursor={'pointer'}
                  title={'Edit'}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const data = await getKbDataItemById(item.id);

                      if (!data) {
                        throw new Error('The data has been deleted');
                      }

                      setEditData({
                        dataId: data.id,
                        ...data
                      });
                    } catch (err) {
                      toast({
                        status: 'warning',
                        title: getErrText(err)
                      });
                    }
                    setLoading(false);
                  }}
                >
                  <Flex p={3} alignItems={'center'} color={'myGray.500'}>
                    <MyIcon name={'kbTest'} w={'14px'} />
                    <Progress
                      mx={2}
                      flex={1}
                      value={item.score * 100}
                      size="sm"
                      borderRadius={'20px'}
                      colorScheme="gray"
                    />
                    <Box>{item.score.toFixed(4)}</Box>
                  </Flex>
                  <Box
                    px={2}
                    fontSize={'xs'}
                    color={'myGray.600'}
                    maxH={'200px'}
                    overflow={'overlay'}
                  >
                    <Box>{item.q}</Box>
                    <Box>{item.a}</Box>
                  </Box>
                </Box>
              ))}
            </Grid>
          </>
        )}
      </Box>

      {editData && (
        <InputDataModal
          kbId={kbId}
          defaultValues={editData}
          onClose={() => setEditData(undefined)}
          onSuccess={(data) => {
            if (kbTestItem && editData.dataId) {
              const newTestItem = {
                ...kbTestItem,
                results: kbTestItem.results.map((item) =>
                  item.id === editData.dataId
                    ? {
                        ...item,
                        q: data.q,
                        a: data.a
                      }
                    : item
                )
              };
              updateKbItemById(newTestItem);
              setKbTestItem(newTestItem);
            }

            setEditData(undefined);
          }}
          onDelete={() => {
            if (kbTestItem && editData.dataId) {
              const newTestItem = {
                ...kbTestItem,
                results: kbTestItem.results.filter((item) => item.id !== editData.dataId)
              };
              updateKbItemById(newTestItem);
              setKbTestItem(newTestItem);
            }
            setEditData(undefined);
          }}
        />
      )}
    </Box>
  );
};

export default Test;
