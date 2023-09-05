import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Flex,
  Switch,
  Input,
  FormControl
} from '@chakra-ui/react';
import type { ContextExtractAgentItemType } from '@/types/app';
import { useForm } from 'react-hook-form';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
import MyModal from '@/components/MyModal';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';

const ExtractFieldModal = ({
  defaultField = {
    desc: '',
    key: '',
    required: true
  },
  onClose,
  onSubmit
}: {
  defaultField?: ContextExtractAgentItemType;
  onClose: () => void;
  onSubmit: (data: ContextExtractAgentItemType) => void;
}) => {
  const { register, handleSubmit } = useForm<ContextExtractAgentItemType>({
    defaultValues: defaultField
  });

  return (
    <MyModal isOpen={true} onClose={onClose}>
      <ModalHeader display={'flex'} alignItems={'center'}>
        <Avatar src={'/imgs/module/extract.png'} mr={2} w={'20px'} objectFit={'cover'} />
        Extract field configuration
      </ModalHeader>
      <ModalBody>
        <Flex alignItems={'center'}>
          <Box flex={'0 0 70px'}>Required</Box>
          <Switch {...register('required')} />
        </Flex>
        <Flex mt={5} alignItems={'center'}>
          <Box flex={'0 0 70px'}>Field Description</Box>
          <Input
            placeholder="name/age/sql statement..."
            {...register('desc', { required: 'Field description cannot be empty' })}
          />
        </Flex>
        <Flex mt={5} alignItems={'center'}>
          <Box flex={'0 0 70px'}>field key</Box>
          <Input
            placeholder="name/age/sql"
            {...register('key', { required: 'field key cannot be empty' })}
          />
        </Flex>
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} mr={3} onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Confirm</Button>
      </ModalFooter>
    </MyModal>
  );
};

export default React.memo(ExtractFieldModal);
