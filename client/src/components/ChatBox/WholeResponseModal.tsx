import React, { useMemo } from 'react';
import { Box, ModalBody, useTheme, ModalHeader, Flex } from '@chakra-ui/react';
import type { ChatHistoryItemResType } from '@/types/chat';
import { useTranslation } from 'react-i18next';

import MyModal from '../MyModal';
import MyTooltip from '../MyTooltip';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

const ResponseModal = ({
  response,
  onClose
}: {
  response: ChatHistoryItemResType[];
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const formatResponse = useMemo(
    () =>
      response.map((item) => {
        const copy = { ...item };
        delete copy.completeMessages;
        delete copy.quoteList;
        return copy;
      }),
    [response]
  );

  return (
    <MyModal
      isOpen={true}
      onClose={onClose}
      h={['90vh', '80vh']}
      minW={['90vw', '600px']}
      title={
        <Flex alignItems={'center'}>
          {t('chat. Complete Response')}
          <MyTooltip
            label={
              'moduleName: model name\nprice: price, multiplier: 100000\nmodel?: model name\ntokens?: token consumption\n\nanswer?: answer content\nquestion?: question\ntemperature?: temperature\nmaxToken?: maximum tokens n\nsimilarity?: similarity\nlimit?: single search result\n\ncqList?: question classification list\ncqResult?: classification result\n\nextractDescription?: content extraction description\nextractResult?: extraction result'
            }
          >
            <QuestionOutlineIcon ml={2} />
          </MyTooltip>
        </Flex>
      }
      isCentered
    >
      <ModalBody>
        {formatResponse.map((item, i) => (
          <Box
            key={i}
            p={2}
            pt={[0, 2]}
            borderRadius={'lg'}
            border={theme.borders.base}
            _notLast={{ mb: 2 }}
            position={'relative'}
            whiteSpace={'pre-wrap'}
          >
            {JSON.stringify(item, null, 2)}
          </Box>
        ))}
      </ModalBody>
    </MyModal>
  );
};

export default ResponseModal;
