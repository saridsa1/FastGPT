import React, { useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  useTheme,
  Flex,
  IconButton,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useUserStore } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { AddIcon } from '@chakra-ui/icons';
import { delModelById } from '@/api/app';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'next-i18next';

import MyIcon from '@/components/Icon';
import PageContainer from '@/components/PageContainer';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import CreateModal from './component/CreateModal';

import styles from './index.module.scss';

const MyApps = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { myApps, loadMyApps } = useUserStore();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: 'Delete Tip',
    content: 'Confirm to delete all information of this application? '
  });
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  /* Click to delete */
  const onclickDelApp = useCallback(
    async (id: string) => {
      try {
        await delModelById(id);
        toast({
          title: 'Delete successfully',
          status: 'success'
        });
        loadMyApps(true);
      } catch (err: any) {
        toast({
          title: err?.message || 'Delete failed',
          status: 'error'
        });
      }
    },
    [toast, loadMyApps]
  );

  /* Load model */
  useQuery(['loadModels'], () => loadMyApps(true), {
    refetchOnMount: true
  });

  return (
    <PageContainer>
      <Flex pt={3} px={5} alignItems={'center'}>
        <Box flex={1} className="textlg" letterSpacing={1} fontSize={'24px'} fontWeight={'bold'}>
          {t('app.My Apps')}
        </Box>
        <Button leftIcon={<AddIcon />} variant={'base'} onClick={onOpenCreateModal}>
          new build
        </Button>
      </Flex>
      <Grid
        p={5}
        gridTemplateColumns={['1fr', 'repeat(3,1fr)', 'repeat(4,1fr)', 'repeat(5,1fr)']}
        gridGap={5}
      >
        {myApps.map((app) => (
          <Card
            key={app._id}
            py={4}
            px={5}
            cursor={'pointer'}
            h={'140px'}
            border={theme.borders.md}
            boxShadow={'none'}
            userSelect={'none'}
            position={'relative'}
            _hover={{
              boxShadow: '1px 1px 10px rgba(0,0,0,0.2)',
              borderColor: 'transparent',
              '& .delete': {
                display: 'block'
              },
              '& .chat': {
                display: 'block'
              }
            }}
            onClick={() => router.push(`/app/detail?appId=${app._id}`)}
          >
            <Flex alignItems={'center'} h={'38px'}>
              <Avatar src={app.avatar} borderRadius={'md'} w={'28px'} />
              <Box ml={3}>{app.name}</Box>
              <IconButton
                className="delete"
                position={'absolute'}
                top={4}
                right={4}
                size={'sm'}
                icon={<MyIcon name={'delete'} w={'14px'} />}
                variant={'base'}
                borderRadius={'md'}
                aria-label={'delete'}
                display={['', 'none']}
                _hover={{
                  bg: 'red.100'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirm(() => onclickDelApp(app._id))();
                }}
              />
            </Flex>
            <Box
              className={styles.intro}
              py={2}
              wordBreak={'break-all'}
              fontSize={'sm'}
              color={'myGray.600'}
            >
              {app.intro || 'This application has not written an introduction~'}
            </Box>
            <IconButton
              className="chat"
              position={'absolute'}
              right={4}
              bottom={4}
              size={'sm'}
              icon={
                <MyTooltip label={'Go to Chat'}>
                  <MyIcon name={'chat'} w={'14px'} />
                </MyTooltip>
              }
              variant={'base'}
              borderRadius={'md'}
              aria-label={'delete'}
              display={['', 'none']}
              _hover={{
                bg: 'myGray.100'
              }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/chat?appId=${app._id}`);
              }}
            />
          </Card>
        ))}
      </Grid>
      <ConfirmModal />
      {isOpenCreateModal && (
        <CreateModal onClose={onCloseCreateModal} onSuccess={() => loadMyApps(true)} />
      )}
    </PageContainer>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default MyApps;
