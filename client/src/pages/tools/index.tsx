import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import MyIcon from '@/components/Icon';
import { useRouter } from 'next/router';
import { feConfigs } from '@/store/static';
import { serviceSideProps } from '@/utils/i18n';
import { useTranslation } from 'react-i18next';

const Tools = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const list = [
    {
      icon: 'dbLight',
      label: 'My Knowledge Base',
      link: '/kb/list'
    },
    ...(feConfigs?.show_appStore
      ? [
          {
            icon: 'appStoreLight',
            label: 'AI application market',
            link: '/appStore'
          }
        ]
      : []),
    ...(feConfigs?.show_git
      ? [
          {
            icon: 'git',
            label: 'GitHub address',
            link: 'https://github.com/labring/FastGPT'
          }
        ]
      : []),
    ...(feConfigs?.show_doc
      ? [
          {
            icon: 'courseLight',
            label: 'Use documentation',
            link: 'https://doc.fastgpt.run/docs/intro'
          }
        ]
      : [])
  ];

  return (
    <Box px={'5vw'}>
      {list.map((item) => (
        <Flex
          key={item.link}
          alignItems={'center'}
          px={5}
          py={4}
          bg={'white'}
          mt={5}
          borderRadius={'md'}
          onClick={() => router.push(item.link)}
        >
          <MyIcon name={item.icon as any} w={'22px'} />
          <Box ml={4} flex={1}>
            {item.label}
          </Box>
          <ChevronRightIcon fontSize={'20px'} color={'myGray.600'} />
        </Flex>
      ))}
    </Box>
  );
};

export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content))
    }
  };
}

export default Tools;
