import React, { useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, IconButton, useTheme } from '@chakra-ui/react';
import { useToast } from '@/hooks/useToast';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user';
import { KbItemType } from '@/types/plugin';
import { getErrText } from '@/utils/tools';
import { useGlobalStore } from '@/store/global';
import { type ComponentRef } from './components/Info';
import Tabs from '@/components/Tabs';
import dynamic from 'next/dynamic';
import DataCard from './components/DataCard';
import MyIcon from '@/components/Icon';
import SideTabs from '@/components/SideTabs';
import PageContainer from '@/components/PageContainer';
import Avatar from '@/components/Avatar';
import Info from './components/Info';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'react-i18next';
import { getTrainingQueueLen } from '@/api/plugins/kb';
import MyTooltip from '@/components/MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { feConfigs } from '@/store/static';

const ImportData = dynamic(() => import('./components/Import'), {
  ssr: false
});
const Test = dynamic(() => import('./components/Test'), {
  ssr: false
});

enum TabEnum {
  data = 'data',
  import = 'import',
  test = 'test',
  info = 'info'
}

const Detail = ({ kbId, currentTab }: { kbId: string; currentTab: `${TabEnum}` }) => {
  const InfoRef = useRef<ComponentRef>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { isPc } = useGlobalStore();
  const { kbDetail, getKbDetail } = useUserStore();

  const tabList = useRef([
    { label: 'dataset', id: TabEnum.data, icon: 'overviewLight' },
    { label: 'Import data', id: TabEnum.import, icon: 'importLight' },
    { label: 'Search Test', id: TabEnum.test, icon: 'kbTest' },
    { label: 'configuration', id: TabEnum.info, icon: 'settingLight' }
  ]);

  const setCurrentTab = useCallback(
    (tab: `${TabEnum}`) => {
      router.replace({
        query: {
          kbId,
          currentTab: tab
        }
      });
    },
    [kbId, router]
  );

  const form = useForm<KbItemType>({
    defaultValues: kbDetail
  });

  useQuery([kbId], () => getKbDetail(kbId), {
    onSuccess(res) {
      form.reset(res);
      InfoRef.current?.initInput(res.tags);
    },
    onError(err: any) {
      router.replace(`/kb/list`);
      toast({
        title: getErrText(err, 'Exception in getting knowledge base'),
        status: 'error'
      });
    }
  });

  const { data: trainingQueueLen = 0 } = useQuery(['getTrainingQueueLen'], getTrainingQueueLen, {
    refetchInterval: 5000
  });

  return (
    <PageContainer>
      <Box display={['block', 'flex']} h={'100%'} pt={[4, 0]}>
        {isPc ? (
          <Flex
            flexDirection={'column'}
            p={4}
            h={'100%'}
            flex={'0 0 200px'}
            borderRight={theme.borders.base}
          >
            <Flex mb={4} alignItems={'center'}>
              <Avatar src={kbDetail.avatar} w={'34px'} borderRadius={'lg'} />
              <Box ml={2} fontWeight={'bold'}>
                {kbDetail.name}
              </Box>
            </Flex>
            <SideTabs
              flex={1}
              mx={'auto'}
              mt={2}
              w={'100%'}
              list={tabList.current}
              activeId={currentTab}
              onChange={(e: any) => {
                setCurrentTab(e);
              }}
            />
            <Box textAlign={'center'}>
              <Flex justifyContent={'center'} alignItems={'center'}>
                <MyIcon mr={1} name="overviewLight" w={'16px'} color={'green.500'} />
                <Box>{t('dataset.System Data Queue')}</Box>
                <MyTooltip
                  label={t('dataset.Queue Desc', { title: feConfigs?.systemTitle })}
                  placement={'top'}
                >
                  <QuestionOutlineIcon ml={1} w={'16px'} />
                </MyTooltip>
              </Flex>
              <Box mt={1} fontWeight={'bold'}>
                {trainingQueueLen}
              </Box>
            </Box>
            <Flex
              alignItems={'center'}
              cursor={'pointer'}
              py={2}
              px={3}
              borderRadius={'md'}
              _hover={{ bg: 'myGray.100' }}
              onClick={() => router.replace('/kb/list')}
            >
              <IconButton
                mr={3}
                icon={<MyIcon name={'backFill'} w={'18px'} color={'myBlue.600'} />}
                bg={'white'}
                boxShadow={'1px 1px 9px rgba(0,0,0,0.15)'}
                h={'28px'}
                size={'sm'}
                borderRadius={'50%'}
                aria-label={''}
              />
              All knowledge base
            </Flex>
          </Flex>
        ) : (
          <Box mb={3}>
            <Tabs
              m={'auto'}
              w={'260px'}
              size={isPc ? 'md' : 'sm'}
              list={tabList.current.map((item) => ({
                id: item.id,
                label: item.label
              }))}
              activeId={currentTab}
              onChange={(e: any) => setCurrentTab(e)}
            />
          </Box>
        )}

        {!!kbDetail._id && (
          <Box flex={'1 0 0'} h={'100%'} pb={[4, 0]}>
            {currentTab === TabEnum.data && <DataCard kbId={kbId} />}
            {currentTab === TabEnum.import && <ImportData kbId={kbId} />}
            {currentTab === TabEnum.test && <Test kbId={kbId} />}
            {currentTab === TabEnum.info && <Info ref={InfoRef} kbId={kbId} form={form} />}
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

export async function getServerSideProps(context: any) {
  const currentTab = context?.query?.currentTab || TabEnum.data;
  const kbId = context?.query?.kbId;

  return {
    props: { currentTab, kbId, ...(await serviceSideProps(context)) }
  };
}

export default React.memo(Detail);
