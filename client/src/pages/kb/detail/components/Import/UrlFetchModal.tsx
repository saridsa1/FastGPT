import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import MyModal from '@/components/MyModal';
import { Box, Button, ModalBody, ModalFooter, Textarea } from '@chakra-ui/react';
import type { FetchResultItem } from '@/types/plugin';
import { useRequest } from '@/hooks/useRequest';
import { fetchUrls } from '@/api/plugins/common';

const UrlFetchModal = ({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: (e: FetchResultItem[]) => void;
}) => {
  const { t } = useTranslation();
  const Dom = useRef<HTMLTextAreaElement>(null);

  const { mutate, isLoading } = useRequest({
    mutationFn: async () => {
      const val = Dom.current?.value || '';
      const urls = val.split('\n').filter((e) => e);
      const res = await fetchUrls(urls);

      onSuccess(res);
      onClose();
    },
    errorToast: 'Failed to obtain link'
  });

  return (
    <MyModal
      title={
        <>
          <Box>{t('file.Fetch Url')}</Box>
          <Box fontWeight={'normal'} fontSize={'sm'} color={'myGray.500'} mt={1}>
            Currently only supports reading static links, please pay attention to the inspection
            results
          </Box>
        </>
      }
      top={'15vh'}
      isOpen
      onClose={onClose}
      w={'600px'}
    >
      <ModalBody>
        <Textarea
          ref={Dom}
          rows={12}
          whiteSpace={'nowrap'}
          resize={'both'}
          placeholder={'up to 10 links, one per line. '}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant={'base'} mr={4} onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isLoading} onClick={mutate}>
          confirm
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default UrlFetchModal;
