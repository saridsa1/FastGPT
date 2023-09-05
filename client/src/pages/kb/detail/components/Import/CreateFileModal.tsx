import React from 'react';
import { useTranslation } from 'next-i18next';
import MyModal from '@/components/MyModal';
import { Box, Input, Textarea, ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const CreateFileModal = ({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: (e: { filename: string; content: string }) => void;
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      filename: '',
      content: ''
    }
  });

  return (
    <MyModal title={t('file.Create File')} isOpen onClose={onClose} w={'600px'} top={'15vh'}>
      <ModalBody>
        <Box mb={1} fontSize={'sm'}>
          file name
        </Box>
        <Input
          mb={5}
          {...register('filename', {
            required: 'File name cannot be empty'
          })}
        />
        <Box mb={1} fontSize={'sm'}>
          document content
        </Box>
        <Textarea
          {...register('content', {
            required: 'File content cannot be empty'
          })}
          rows={12}
          whiteSpace={'nowrap'}
          resize={'both'}
        />
      </ModalBody>
      <ModalFooter>
        <Button variant={'base'} mr={4} onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleSubmit(onSuccess)();
            onClose();
          }}
        >
          confirm
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default CreateFileModal;
