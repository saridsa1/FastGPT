import React, { useCallback, useState } from 'react';
import { ModalBody, Box, useTheme } from '@chakra-ui/react';
import { getKbDataItemById } from '@/api/plugins/kb';
import { useLoading } from '@/hooks/useLoading';
import { useToast } from '@/hooks/useToast';
import { getErrText } from '@/utils/tools';
import { QuoteItemType } from '@/types/chat';
import MyIcon from '@/components/Icon';
import InputDataModal, { RawFileText } from '@/pages/kb/detail/components/InputDataModal';
import MyModal from '../MyModal';
import { KbDataItemType } from '@/types/plugin';

type SearchType = KbDataItemType & {
  kb_id?: string;
};

const QuoteModal = ({
  onUpdateQuote,
  rawSearch = [],
  onClose
}: {
  onUpdateQuote: (quoteId: string, sourceText: string) => Promise<void>;
  rawSearch: SearchType[];
  onClose: () => void;
}) => {
  const theme = useTheme();
  const { toast } = useToast();
  const { setIsLoading, Loading } = useLoading();
  const [editDataItem, setEditDataItem] = useState<QuoteItemType>();

  /**
   * click edit, get new kbDataItem
   */
  const onclickEdit = useCallback(
    async (item: SearchType) => {
      if (!item.id) return;
      try {
        setIsLoading(true);
        const data = await getKbDataItemById(item.id);

        if (!data) {
          onUpdateQuote(item.id, 'Deleted');
          throw new Error('The data has been deleted');
        }

        setEditDataItem(data);
      } catch (err) {
        toast({
          status: 'warning',
          title: getErrText(err)
        });
      }
      setIsLoading(false);
    },
    [setIsLoading, toast, onUpdateQuote]
  );

  return (
    <>
      <MyModal
        isOpen={true}
        onClose={onClose}
        h={['90vh', '80vh']}
        isCentered
        minW={['90vw', '600px']}
        title={
          <>
            Knowledge base references ({rawSearch.length} entries)
            <Box fontSize={['xs', 'sm']} fontWeight={'normal'}>
              Note: After successfully modifying the knowledge base content, the changes will not be
              displayed here. After clicking edit, the latest content of the knowledge base will be
              displayed.
            </Box>
          </>
        }
      >
        <ModalBody
          pt={0}
          whiteSpace={'pre-wrap'}
          textAlign={'justify'}
          wordBreak={'break-all'}
          fontSize={'sm'}
        >
          {rawSearch.map((item, i) => (
            <Box
              key={i}
              flex={'1 0 0'}
              p={2}
              borderRadius={'lg'}
              border={theme.borders.base}
              _notLast={{ mb: 2 }}
              position={'relative'}
              _hover={{ '& .edit': { display: 'flex' } }}
              overflow={'hidden'}
            >
              {item.source && <RawFileText filename={item.source} fileId={item.file_id} />}
              <Box>{item.q}</Box>
              <Box>{item.a}</Box>
              {item.id && (
                <Box
                  className="edit"
                  display={'none'}
                  position={'absolute'}
                  right={0}
                  top={0}
                  bottom={0}
                  w={'40px'}
                  bg={'rgba(255,255,255,0.9)'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  boxShadow={'-10px 0 10px rgba(255,255,255,1)'}
                >
                  <MyIcon
                    name={'edit'}
                    w={'18px'}
                    h={'18px'}
                    cursor={'pointer'}
                    color={'myGray.600'}
                    _hover={{
                      color: 'myBlue.700'
                    }}
                    onClick={() => onclickEdit(item)}
                  />
                </Box>
              )}
            </Box>
          ))}
        </ModalBody>
        <Loading fixed={false} />
      </MyModal>
      {editDataItem && (
        <InputDataModal
          onClose={() => setEditDataItem(undefined)}
          onSuccess={() => onUpdateQuote(editDataItem.id, 'Manual modification')}
          onDelete={() => onUpdateQuote(editDataItem.id, 'Deleted')}
          kbId={editDataItem.kb_id}
          defaultValues={{
            ...editDataItem,
            dataId: editDataItem.id
          }}
        />
      )}
    </>
  );
};

export default QuoteModal;
