import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  BoxProps,
  Textarea,
  useTheme,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  Button,
  IconButton
} from '@chakra-ui/react';
import { useUserStore } from '@/store/user';
import { useQuery } from '@tanstack/react-query';
import { QuestionOutlineIcon, SmallAddIcon } from '@chakra-ui/icons';
import { useForm, useFieldArray } from 'react-hook-form';
import { useGlobalStore } from '@/store/global';
import {
  appModules2Form,
  getDefaultAppForm,
  appForm2Modules,
  type EditFormType
} from '@/utils/app';
import { chatModelList } from '@/store/static';
import { formatPrice } from '@/utils/user';
import {
  ChatModelSystemTip,
  ChatModelLimitTip,
  welcomeTextTip
} from '@/constants/flow/ModuleTemplate';
import { AppModuleItemType, VariableItemType } from '@/types/app';
import { useRequest } from '@/hooks/useRequest';
import { useConfirm } from '@/hooks/useConfirm';
import { FlowModuleTypeEnum } from '@/constants/flow';
import { streamFetch } from '@/api/fetch';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks/useToast';
import { AppSchema } from '@/types/mongoSchema';
import { delModelById } from '@/api/app';
import { useTranslation } from 'react-i18next';
import { getSpecialModule } from '@/components/ChatBox/utils';

import dynamic from 'next/dynamic';
import MySelect from '@/components/Select';
import MySlider from '@/components/Slider';
import MyTooltip from '@/components/MyTooltip';
import Avatar from '@/components/Avatar';
import MyIcon from '@/components/Icon';
import ChatBox, { type ComponentRef, type StartChatFnProps } from '@/components/ChatBox';

import { addVariable } from '../VariableEditModal';
import { KBSelectModal, KbParamsModal } from '../KBSelectModal';
import { AppTypeEnum } from '@/constants/app';

const VariableEditModal = dynamic(() => import('../VariableEditModal'));
const InfoModal = dynamic(() => import('../InfoModal'));

const Settings = ({ appId }: { appId: string }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { appDetail, updateAppDetail, loadKbList, myKbList } = useUserStore();
  const { isPc } = useGlobalStore();

  const [editVariable, setEditVariable] = useState<VariableItemType>();
  const [settingAppInfo, setSettingAppInfo] = useState<AppSchema>();

  const [refresh, setRefresh] = useState(false);

  const { openConfirm: openConfirmSave, ConfirmModal: ConfirmSaveModal } = useConfirm({
    content: t('app. Confirm Save App Tip')
  });
  const { openConfirm: openConfirmDel, ConfirmModal: ConfirmDelModal } = useConfirm({
    content: t('app. Confirm Del App Tip')
  });
  const { register, setValue, getValues, reset, handleSubmit, control } = useForm<EditFormType>({
    defaultValues: getDefaultAppForm()
  });
  const {
    fields: variables,
    append: appendVariable,
    remove: removeVariable,
    replace: replaceVariables
  } = useFieldArray({
    control,
    name: 'variables'
  });
  const { fields: kbList, replace: replaceKbList } = useFieldArray({
    control,
    name: 'kb.list'
  });

  const {
    isOpen: isOpenKbSelect,
    onOpen: onOpenKbSelect,
    onClose: onCloseKbSelect
  } = useDisclosure();
  const {
    isOpen: isOpenKbParams,
    onOpen: onOpenKbParams,
    onClose: onCloseKbParams
  } = useDisclosure();

  const chatModelSelectList = useMemo(() => {
    return chatModelList.map((item) => ({
      value: item.model,
      label: `${item.name} (${formatPrice(item.price, 1000)} yuan/1k tokens)`
    }));
  }, [refresh]);
  const tokenLimit = useMemo(() => {
    return (
      chatModelList.find((item) => item.model === getValues('chatModel.model'))?.contextMaxToken ||
      4000
    );
  }, [getValues, refresh]);
  const selectedKbList = useMemo(
    () => myKbList.filter((item) => kbList.find((kb) => kb.kbId === item._id)),
    [myKbList, kbList]
  );

  /* Click to delete */
  const { mutate: handleDelModel, isLoading } = useRequest({
    mutationFn: async () => {
      if (!appDetail) return null;
      await delModelById(appDetail._id);
      return 'success';
    },
    onSuccess(res) {
      if (!res) return;
      toast({
        title: 'Delete successfully',
        status: 'success'
      });
      router.replace(`/app/list`);
    },
    errorToast: 'Delete failed'
  });

  const appModule2Form = useCallback(() => {
    const formVal = appModules2Form(appDetail.modules);
    reset(formVal);
    setRefresh((state) => !state);
  }, [appDetail.modules, reset]);

  const { mutate: onSubmitSave, isLoading: isSaving } = useRequest({
    mutationFn: async (data: EditFormType) => {
      const modules = appForm2Modules(data);

      await updateAppDetail(appDetail._id, {
        modules,
        type: AppTypeEnum.basic
      });
    },
    successToast: 'Save successfully',
    errorToast: 'Exception occurred while saving'
  });

  useEffect(() => {
    appModule2Form();
  }, [appModule2Form]);

  useQuery(['initkb', appId], () => loadKbList());

  const BoxStyles: BoxProps = {
    bg: 'myWhite.200',
    px: 4,
    py: 3,
    borderRadius: 'lg',
    border: theme.borders.base
  };
  const BoxBtnStyles: BoxProps = {
    cursor: 'pointer',
    px: 3,
    py: '2px',
    borderRadius: 'md',
    _hover: {
      bg: 'myGray.200'
    }
  };
  const LabelStyles: BoxProps = {
    w: ['60px', '100px'],
    flexShrink: 0,
    fontSize: ['sm', 'md']
  };

  return (
    <Box
      h={'100%'}
      borderRight={'1.5px solid'}
      borderColor={'myGray.200'}
      p={4}
      pt={[0, 4]}
      overflow={'overlay'}
    >
      <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
        basic information
      </Box>
      {/* basic info */}
      <Box
        border={theme.borders.base}
        borderRadius={'lg'}
        mt={2}
        px={5}
        py={4}
        bg={'myBlue.100'}
        position={'relative'}
      >
        <Flex alignItems={'center'} py={2}>
          <Avatar src={appDetail.avatar} borderRadius={'md'} w={'28px'} />
          <Box ml={3} fontWeight={'bold'} fontSize={'lg'}>
            {appDetail.name}
          </Box>
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
            _hover={{
              bg: 'myGray.100',
              color: 'red.600'
            }}
            isLoading={isLoading}
            onClick={openConfirmDel(handleDelModel)}
          />
        </Flex>
        <Box
          flex={1}
          my={2}
          className={'textEllipsis3'}
          wordBreak={'break-all'}
          color={'myGray.600'}
        >
          {appDetail.intro || 'Come and give an introduction to the application~'}
        </Box>
        <Flex>
          <Button
            size={['sm', 'md']}
            variant={'base'}
            leftIcon={<MyIcon name={'chat'} w={'16px'} />}
            onClick={() => router.push(`/chat?appId=${appId}`)}
          >
            dialogue
          </Button>
          <Button
            mx={3}
            size={['sm', 'md']}
            variant={'base'}
            leftIcon={<MyIcon name={'shareLight'} w={'16px'} />}
            onClick={() => {
              router.replace({
                query: {
                  appId,
                  currentTab: 'outLink'
                }
              });
            }}
          >
            external
          </Button>
          <Button
            size={['sm', 'md']}
            variant={'base'}
            leftIcon={<MyIcon name={'settingLight'} w={'16px'} />}
            onClick={() => setSettingAppInfo(appDetail)}
          >
            set up
          </Button>
        </Flex>
      </Box>

      <Flex mt={5} justifyContent={'space-between'} alignItems={'center'}>
        <Box fontSize={['md', 'xl']} fontWeight={'bold'}>
          Application configuration
          <MyTooltip
            label={
              'Contains only basic functions, please use advanced orchestration for complex agent functions. '
            }
            forceShow
          >
            <QuestionOutlineIcon ml={2} fontSize={'md'} />
          </MyTooltip>
        </Box>
        <Button
          isLoading={isSaving}
          fontSize={'sm'}
          size={['sm', 'md']}
          onClick={() => {
            if (appDetail.type !== AppTypeEnum.basic) {
              openConfirmSave(handleSubmit((data) => onSubmitSave(data)))();
            } else {
              handleSubmit((data) => onSubmitSave(data))();
            }
          }}
        >
          {isPc ? 'Save and preview' : 'Save'}
        </Button>
      </Flex>

      {/* variable */}
      <Box mt={2} {...BoxStyles}>
        <Flex alignItems={'center'}>
          <Avatar src={'/imgs/module/variable.png'} objectFit={'contain'} w={'18px'} />
          <Box ml={2} flex={1}>
            variable
          </Box>
          <Flex {...BoxBtnStyles} onClick={() => setEditVariable(addVariable())}>
            + New
          </Flex>
        </Flex>
        <Box mt={2} borderRadius={'lg'} overflow={'hidden'} borderWidth={'1px'} borderBottom="none">
          <TableContainer>
            <Table bg={'white'}>
              <Thead>
                <Tr>
                  <Th>Variable name</Th>
                  <Th>Variable key</Th>
                  <Th>Required</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {variables.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>{item.label} </Td>
                    <Td>{item.key}</Td>
                    <Td>{item.required ? '✔' : ''}</Td>
                    <Td>
                      <MyIcon
                        mr={3}
                        name={'settingLight'}
                        w={'16px'}
                        cursor={'pointer'}
                        onClick={() => setEditVariable(item)}
                      />
                      <MyIcon
                        name={'delete'}
                        w={'16px'}
                        cursor={'pointer'}
                        onClick={() => removeVariable(index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* model */}
      <Box mt={5} {...BoxStyles}>
        <Flex alignItems={'center'}>
          <Avatar src={'/imgs/module/AI.png'} w={'18px'} />
          <Box ml={2}>AI Configuration</Box>
        </Flex>

        <Flex alignItems={'center'} mt={5}>
          <Box {...LabelStyles}>Dialogue Model</Box>
          <MySelect
            width={['100%', '300px']}
            value={getValues('chatModel.model')}
            list={chatModelSelectList}
            onchange={(val: any) => {
              setValue('chatModel.model', val);
              const maxToken =
                chatModelList.find((item) => item.model === getValues('chatModel.model'))
                  ?.contextMaxToken || 4000;
              const token = maxToken / 2;
              setValue('chatModel.maxToken', token);
              setRefresh(!refresh);
            }}
          />
        </Flex>
        <Flex alignItems={'center'} my={10}>
          <Box {...LabelStyles}>Temperature</Box>
          <Box flex={1} ml={'10px'}>
            <MySlider
              markList={[
                { label: 'rigorous', value: 0 },
                { label: 'divergent', value: 10 }
              ]}
              width={'95%'}
              min={0}
              max={10}
              value={getValues('chatModel.temperature')}
              onChange={(e) => {
                setValue('chatModel.temperature', e);
                setRefresh(!refresh);
              }}
            />
          </Box>
        </Flex>
        <Flex alignItems={'center'} mt={12} mb={10}>
          <Box {...LabelStyles}>Reply limit</Box>
          <Box flex={1} ml={'10px'}>
            <MySlider
              markList={[
                { label: '100', value: 100 },
                { label: `${tokenLimit}`, value: tokenLimit }
              ]}
              width={'95%'}
              min={100}
              max={tokenLimit}
              step={50}
              value={getValues('chatModel.maxToken')}
              onChange={(val) => {
                setValue('chatModel.maxToken', val);
                setRefresh(!refresh);
              }}
            />
          </Box>
        </Flex>
        <Flex mt={10} alignItems={'flex-start'}>
          <Box {...LabelStyles}>
            prompt word
            <MyTooltip label={ChatModelSystemTip} forceShow>
              <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
            </MyTooltip>
          </Box>
          <Textarea
            rows={5}
            placeholder={ChatModelSystemTip}
            borderColor={'myGray.100'}
            {...register('chatModel.systemPrompt')}
          ></Textarea>
        </Flex>
        <Flex mt={5} alignItems={'flex-start'}>
          <Box {...LabelStyles}>
            Qualifiers
            <MyTooltip label={ChatModelLimitTip} forceShow>
              <QuestionOutlineIcon display={['none', 'inline']} ml={1} />
            </MyTooltip>
          </Box>
          <Textarea
            rows={5}
            placeholder={ChatModelLimitTip}
            borderColor={'myGray.100'}
            {...register('chatModel.limitPrompt')}
          ></Textarea>
        </Flex>
      </Box>

      {/* kb */}
      <Box mt={5} {...BoxStyles}>
        <Flex alignItems={'center'}>
          <Flex alignItems={'center'} flex={1}>
            <Avatar src={'/imgs/module/db.png'} w={'18px'} />
            <Box ml={2}>Knowledge Base</Box>
          </Flex>
          <Flex alignItems={'center'} mr={3} {...BoxBtnStyles} onClick={onOpenKbSelect}>
            <SmallAddIcon />
            choose
          </Flex>
          <Flex alignItems={'center'} {...BoxBtnStyles} onClick={onOpenKbParams}>
            <MyIcon name={'edit'} w={'14px'} mr={1} />
            parameter
          </Flex>
        </Flex>
        <Flex mt={1} color={'myGray.600'} fontSize={['sm', 'md']}>
          Similarity: {getValues('kb.searchSimilarity')}, single search quantity:{' '}
          {getValues('kb.searchLimit')}, Deny reply when empty search:{' '}
          {getValues('kb.searchEmptyText') !== '' ? 'true' : 'false'}
        </Flex>
        <Grid templateColumns={['repeat(2,1fr)', 'repeat(3,1fr)']} my={2} gridGap={[2, 4]}>
          {selectedKbList.map((item) => (
            <MyTooltip key={item._id} label={'View knowledge base details'}>
              <Flex
                alignItems={'center'}
                p={2}
                bg={'white'}
                boxShadow={'0 4px 8px -2px rgba(16,24,40,.1),0 2px 4px -2px rgba(16,24,40,.06)'}
                borderRadius={'md'}
                border={theme.borders.base}
                cursor={'pointer'}
                onClick={() =>
                  router.push({
                    pathname: '/kb/detail',
                    query: {
                      kbId: item._id
                    }
                  })
                }
              >
                <Avatar src={item.avatar} w={'18px'} mr={1} />
                <Box flex={'1 0 0'} w={0} className={'textEllipsis'} fontSize={'sm'}>
                  {item.name}
                </Box>
              </Flex>
            </MyTooltip>
          ))}
        </Grid>
      </Box>

      {/* welcome */}
      <Box mt={5} {...BoxStyles}>
        <Flex alignItems={'center'}>
          <Avatar src={'/imgs/module/userGuide.png'} w={'18px'} />
          <Box mx={2}>Conversation Opener</Box>
          <MyTooltip label={welcomeTextTip} forceShow>
            <QuestionOutlineIcon />
          </MyTooltip>
        </Flex>
        <Textarea
          mt={2}
          rows={5}
          placeholder={welcomeTextTip}
          borderColor={'myGray.100'}
          {...register('guide.welcome.text')}
        />
      </Box>

      <ConfirmSaveModal />
      <ConfirmDelModal />
      {settingAppInfo && (
        <InfoModal defaultApp={settingAppInfo} onClose={() => setSettingAppInfo(undefined)} />
      )}
      {editVariable && (
        <VariableEditModal
          defaultVariable={editVariable}
          onClose={() => setEditVariable(undefined)}
          onSubmit={({ variable }) => {
            const record = variables.find((item) => item.id === variable.id);
            if (record) {
              replaceVariables(
                variables.map((item) => (item.id === variable.id ? variable : item))
              );
            } else {
              // auth same key
              if (variables.find((item) => item.key === variable.key)) {
                return toast({
                  status: 'warning',
                  title: t('app. Variable Key Repeat Tip')
                });
              }
              appendVariable(variable);
            }

            setEditVariable(undefined);
          }}
        />
      )}
      {isOpenKbSelect && (
        <KBSelectModal
          kbList={myKbList}
          activeKbs={selectedKbList.map((item) => ({
            kbId: item._id,
            vectorModel: item.vectorModel
          }))}
          onClose={onCloseKbSelect}
          onChange={replaceKbList}
        />
      )}
      {isOpenKbParams && (
        <KbParamsModal
          searchEmptyText={getValues('kb.searchEmptyText')}
          searchLimit={getValues('kb.searchLimit')}
          searchSimilarity={getValues('kb.searchSimilarity')}
          onClose={onCloseKbParams}
          onChange={({ searchEmptyText, searchLimit, searchSimilarity }) => {
            setValue('kb.searchEmptyText', searchEmptyText);
            setValue('kb.searchLimit', searchLimit);
            setValue('kb.searchSimilarity', searchSimilarity);
            setRefresh((state) => !state);
          }}
        />
      )}
    </Box>
  );
};

const ChatTest = ({ appId }: { appId: string }) => {
  const { t } = useTranslation();
  const { appDetail, userInfo } = useUserStore();
  const ChatBoxRef = useRef<ComponentRef>(null);
  const [modules, setModules] = useState<AppModuleItemType[]>([]);

  const startChat = useCallback(
    async ({ chatList, controller, generatingMessage, variables }: StartChatFnProps) => {
      const historyMaxLen =
        modules
          ?.find((item) => item.flowType === FlowModuleTypeEnum.historyNode)
          ?.inputs?.find((item) => item.key === 'maxContext')?.value || 0;
      const history = chatList.slice(-historyMaxLen - 2, -2);

      //Stream request, get data
      const { responseText, responseData } = await streamFetch({
        url: '/api/chat/chatTest',
        data: {
          history,
          prompt: chatList[chatList.length - 2].value,
          modules,
          variables,
          appId,
          appName: `Debug-${appDetail.name}`
        },
        onMessage: generatingMessage,
        abortSignal: controller
      });

      return { responseText, responseData };
    },
    [modules, appId, appDetail.name]
  );

  const resetChatBox = useCallback(() => {
    ChatBoxRef.current?.resetHistory([]);
    ChatBoxRef.current?.resetVariables();
  }, []);

  useEffect(() => {
    const formVal = appModules2Form(appDetail.modules);
    setModules(appForm2Modules(formVal));
    resetChatBox();
  }, [appDetail, resetChatBox]);

  return (
    <Flex position={'relative'} flexDirection={'column'} h={'100%'} py={4} overflowX={'auto'}>
      <Flex px={[2, 5]}>
        <Box fontSize={['md', 'xl']} fontWeight={'bold'} flex={1}>
          debug preview
        </Box>
        <MyTooltip label={'Reset'}>
          <IconButton
            className="chat"
            size={'sm'}
            icon={<MyIcon name={'clear'} w={'14px'} />}
            variant={'base'}
            borderRadius={'md'}
            aria-label={'delete'}
            onClick={(e) => {
              e.stopPropagation();
              resetChatBox();
            }}
          />
        </MyTooltip>
      </Flex>
      <Box flex={1}>
        <ChatBox
          ref={ChatBoxRef}
          appAvatar={appDetail.avatar}
          userAvatar={userInfo?.avatar}
          showMarkIcon
          {...getSpecialModule(modules)}
          onStartChat={startChat}
          onDelMessage={() => {}}
        />
      </Box>
      {appDetail.type !== AppTypeEnum.basic && (
        <Flex
          position={'absolute'}
          top={0}
          right={0}
          left={0}
          bottom={0}
          bg={'rgba(255,255,255,0.6)'}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection={'column'}
          fontSize={'lg'}
          color={'black'}
          whiteSpace={'pre-wrap'}
          textAlign={'center'}
        >
          <Box>{t('app.Advance App TestTip')}</Box>
        </Flex>
      )}
    </Flex>
  );
};

const BasicEdit = ({ appId }: { appId: string }) => {
  const { isPc } = useGlobalStore();
  return (
    <Grid gridTemplateColumns={['1fr', '550px 1fr']} h={'100%'}>
      <Settings appId={appId} />
      {isPc && <ChatTest appId={appId} />}
    </Grid>
  );
};

export default BasicEdit;
