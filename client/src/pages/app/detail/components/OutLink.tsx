import React, { useState } from 'react';
import {
  Flex,
  Box,
  Button,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  useDisclosure,
  ModalFooter,
  ModalBody,
  FormControl,
  Input,
  useTheme
} from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons';
import MyIcon from '@/components/Icon';
import { useLoading } from '@/hooks/useLoading';
import { useQuery } from '@tanstack/react-query';
import { getShareChatList, delShareChatById, createShareChat } from '@/api/chat';
import { formatTimeToChatTime, useCopyData } from '@/utils/tools';
import { useForm } from 'react-hook-form';
import { defaultShareChat } from '@/constants/model';
import type { ShareChatEditType } from '@/types/app';
import { useRequest } from '@/hooks/useRequest';
import { formatPrice } from '@/utils/user';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';
import MyRadio from '@/components/Radio';

const Share = ({ appId }: { appId: string }) => {
  const { Loading, setIsLoading } = useLoading();
  const { copyData } = useCopyData();
  const {
    isOpen: isOpenCreateShareChat,
    onOpen: onOpenCreateShareChat,
    onClose: onCloseCreateShareChat
  } = useDisclosure();
  const {
    register: registerShareChat,
    getValues: getShareChatValues,
    setValue: setShareChatValues,
    handleSubmit: submitShareChat,
    reset: resetShareChat
  } = useForm({
    defaultValues: defaultShareChat
  });

  const {
    isFetching,
    data: shareChatList = [],
    refetch: refetchShareChatList
  } = useQuery(['initShareChatList', appId], () => getShareChatList(appId));

  const { mutate: onclickCreateShareChat, isLoading: creating } = useRequest({
    mutationFn: async (e: ShareChatEditType) =>
      createShareChat({
        ...e,
        appId
      }),
    errorToast: 'Create share link exception',
    onSuccess(id) {
      onCloseCreateShareChat();
      refetchShareChatList();
      const url = `${location.origin}/chat/share?shareId=${id}`;
      copyData(
        url,
        'Created successfully. The sharing address has been copied and can be shared directly'
      );
      resetShareChat(defaultShareChat);
    }
  });

  return (
    <Box position={'relative'} pt={[3, 5, 8]} px={[5, 8]} minH={'50vh'}>
      <Flex justifyContent={'space-between'}>
        <Box fontWeight={'bold'}>
          Free login window
          <MyTooltip
            forceShow
            label="You can directly share the model with other users for dialogue, and the other party can directly communicate without logging in. Note that this function will consume tokens of your account. Please keep the link and password safe."
          >
            <QuestionOutlineIcon ml={1} />
          </MyTooltip>
        </Box>
        <Button
          variant={'base'}
          colorScheme={'myBlue'}
          size={['sm', 'md']}
          {...(shareChatList.length >= 10
            ? {
                isDisabled: true,
                title: 'Create up to 10 groups'
              }
            : {})}
          onClick={onOpenCreateShareChat}
        >
          Create new link
        </Button>
      </Flex>
      <TableContainer mt={3}>
        <Table variant={'simple'} w={'100%'} overflowX={'auto'}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Amount consumption</Th>
              <Th>Last usage time</Th>
              <Th>Operation</Th>
            </Tr>
          </Thead>
          <Tbody>
            {shareChatList.map((item) => (
              <Tr key={item._id}>
                <Td>{item.name}</Td>
                <Td>{formatPrice(item.total)}yuan</Td>
                <Td>{item.lastTime ? formatTimeToChatTime(item.lastTime) : 'not used'}</Td>
                <Td display={'flex'} alignItems={'center'}>
                  <MyTooltip label={'embed in web page'}>
                    <MyIcon
                      mr={4}
                      name="apiLight"
                      w={'14px'}
                      cursor={'pointer'}
                      _hover={{ color: 'myBlue.600' }}
                      onClick={() => {
                        const url = `${location.origin}/chat/share?shareId=${item.shareId}`;
                        const src = `${location.origin}/js/iframe.js`;
                        const script = `<script src="${src}" id="fastgpt-iframe" data-src="${url}" data-color="#4e83fd"></script>`;
                        copyData(
                          script,
                          'The embedded script has been copied and can be embedded at the bottom of the application HTML',
                          3000
                        );
                      }}
                    />
                  </MyTooltip>
                  <MyTooltip label={'Copy share link'}>
                    <MyIcon
                      mr={4}
                      name="copy"
                      w={'14px'}
                      cursor={'pointer'}
                      _hover={{ color: 'myBlue.600' }}
                      onClick={() => {
                        const url = `${location.origin}/chat/share?shareId=${item.shareId}`;
                        copyData(
                          url,
                          'The sharing link has been copied and can be shared directly'
                        );
                      }}
                    />
                  </MyTooltip>
                  <MyTooltip label={'Delete link'}>
                    <MyIcon
                      name="delete"
                      w={'14px'}
                      cursor={'pointer'}
                      _hover={{ color: 'red' }}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await delShareChatById(item._id);
                          refetchShareChatList();
                        } catch (error) {
                          console.log(error);
                        }
                        setIsLoading(false);
                      }}
                    />
                  </MyTooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {shareChatList.length === 0 && !isFetching && (
        <Flex h={'100%'} flexDirection={'column'} alignItems={'center'} pt={'10vh'}>
          <MyIcon name="empty" w={'48px'} h={'48px'} color={'transparent'} />
          <Box mt={2} color={'myGray.500'}>
            No sharing link created
          </Box>
        </Flex>
      )}
      {/* create shareChat modal */}
      <MyModal
        isOpen={isOpenCreateShareChat}
        onClose={onCloseCreateShareChat}
        title={'Create a login-free window'}
      >
        <ModalBody>
          <FormControl>
            <Flex alignItems={'center'}>
              <Box flex={'0 0 60px'} w={0}>
                name:
              </Box>
              <Input
                placeholder="Record name, for display only"
                maxLength={20}
                {...registerShareChat('name', {
                  required: 'Record name cannot be empty'
                })}
              />
            </Flex>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant={'base'} mr={3} onClick={onCloseCreateShareChat}>
            Cancel
          </Button>

          <Button
            isLoading={creating}
            onClick={submitShareChat((data) => onclickCreateShareChat(data))}
          >
            confirm
          </Button>
        </ModalFooter>
      </MyModal>
      <Loading loading={isFetching} fixed={false} />
    </Box>
  );
};

enum LinkTypeEnum {
  share = 'share',
  iframe = 'iframe'
}

const OutLink = ({ appId }: { appId: string }) => {
  const theme = useTheme();

  const [linkType, setLinkType] = useState<`${LinkTypeEnum}`>(LinkTypeEnum.share);

  return (
    <Box pt={[1, 5]}>
      <Box fontWeight={'bold'} fontSize={['md', 'xl']} mb={2} px={[4, 8]}>
        External use
      </Box>
      <Box pb={[5, 7]} px={[4, 8]} borderBottom={theme.borders.base}>
        <MyRadio
          gridTemplateColumns={['repeat(1,1fr)', 'repeat(auto-fill, minmax(0, 360px))']}
          iconSize={'20px'}
          list={[
            {
              icon: 'outlink_share',
              title: 'Login-free window',
              desc: 'Share the link to other users and use it directly without logging in',
              value: LinkTypeEnum.share
            }
            // {
            // icon: 'outlink_iframe',
            // title: 'Web page embedded',
            // desc: 'Embedded into an existing web page, a dialogue button will be generated in the lower right corner',
            // value: LinkTypeEnum.iframe
            // }
          ]}
          value={linkType}
          onChange={(e) => setLinkType(e as `${LinkTypeEnum}`)}
        />
      </Box>

      {linkType === LinkTypeEnum.share && <Share appId={appId} />}
    </Box>
  );
};

export default OutLink;
