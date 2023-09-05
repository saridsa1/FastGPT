import React, { useCallback } from 'react';
import {
  Box,
  Card,
  Flex,
  Grid,
  useTheme,
  Button,
  IconButton,
  useDisclosure
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useUserStore } from '@/store/user';
import PageContainer from '@/components/PageContainer';
import { useConfirm } from '@/hooks/useConfirm';
import { AddIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { delKbById } from '@/api/plugins/kb';
import Avatar from '@/components/Avatar';
import MyIcon from '@/components/Icon';
import Tag from '@/components/Tag';
import { serviceSideProps } from '@/utils/i18n';
import dynamic from 'next/dynamic';

const CreateModal = dynamic(() => import('./component/CreateModal'), { ssr: false });

const Kb = () => {
  const theme = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const { openConfirm, ConfirmModal } = useConfirm({
    title: 'Delete Tip',
    content:
      'Confirm to delete this knowledge base? The files and records related to the knowledge base will be permanently deleted and cannot be recovered! '
  });
  const { myKbList, loadKbList, setKbList } = useUserStore();

  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onClose: onCloseCreateModal
  } = useDisclosure();

  const { refetch } = useQuery(['loadKbList'], () => loadKbList());

  /* Click to delete */
  const onclickDelKb = useCallback(
    async (id: string) => {
      try {
        delKbById(id);
        toast({
          title: 'Delete successfully',
          status: 'success'
        });
        setKbList(myKbList.filter((item) => item._id !== id));
      } catch (err: any) {
        toast({
          title: err?.message || 'Delete failed',
          status: 'error'
        });
      }
    },
    [toast, setKbList, myKbList]
  );

  return (
    <PageContainer>
      <Flex pt={3} px={5} alignItems={'center'}>
        <Box flex={1} className="textlg" letterSpacing={1} fontSize={'24px'} fontWeight={'bold'}>
          my knowledge base
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
        {myKbList.map((kb) => (
          <Card
            display={'flex'}
            flexDirection={'column'}
            key={kb._id}
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
              }
            }}
            onClick={() =>
              router.push({
                pathname: '/kb/detail',
                query: {
                  kbId: kb._id
                }
              })
            }
          >
            <Flex alignItems={'center'} h={'38px'}>
              <Avatar src={kb.avatar} borderRadius={'lg'} w={'28px'} />
              <Box ml={3}>{kb.name}</Box>
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
                  openConfirm(() => onclickDelKb(kb._id))();
                }}
              />
            </Flex>
            <Box flex={'1 0 0'} overflow={'hidden'} pt={2}>
              <Flex>
                {kb.tags.map((tag, i) => (
                  <Tag key={i} mr={2} mb={2}>
                    {tag}
                  </Tag>
                ))}
              </Flex>
            </Box>
            <Flex justifyContent={'flex-end'} alignItems={'center'} fontSize={'sm'}>
              <MyIcon mr={1} name="kbTest" w={'12px'} />
              <Box color={'myGray.500'}>{kb.vectorModel.name}</Box>
            </Flex>
          </Card>
        ))}
      </Grid>
      {myKbList.length === 0 && (
        <Flex mt={'35vh'} flexDirection={'column'} alignItems={'center'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            No knowledge base yet, create one now!
          </Box>
        </Flex>
      )}
      <ConfirmModal />
      {isOpenCreateModal && <CreateModal onClose={onCloseCreateModal} />}
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

export default Kb;
