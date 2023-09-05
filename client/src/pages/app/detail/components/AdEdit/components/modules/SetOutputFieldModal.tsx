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
import type { ContextExtractAgentItemType, HttpFieldItemType } from '@/types/app';
import { useForm } from 'react-hook-form';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
import MyModal from '@/components/MyModal';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import { FlowOutputItemTypeEnum, FlowValueTypeEnum, FlowValueTypeStyle } from '@/constants/flow';
import { useTranslation } from 'react-i18next';
import MySelect from '@/components/Select';
import { FlowOutputItemType } from '@/types/flow';

const typeSelectList = [
  {
    label: 'string',
    value: FlowValueTypeEnum.string
  },
  {
    label: 'number',
    value: FlowValueTypeEnum.number
  },
  {
    label: 'Boolean',
    value: FlowValueTypeEnum.boolean
  },
  {
    label: 'any',
    value: FlowValueTypeEnum.any
  }
];

const SetInputFieldModal = ({
  defaultField,
  onClose,
  onSubmit
}: {
  defaultField: FlowOutputItemType;
  onClose: () => void;
  onSubmit: (data: FlowOutputItemType) => void;
}) => {
  const { t } = useTranslation();
  const { register, getValues, setValue, handleSubmit } = useForm<FlowOutputItemType>({
    defaultValues: defaultField
  });
  const [refresh, setRefresh] = useState(false);

  return (
    <MyModal isOpen={true} onClose={onClose}>
      <ModalHeader display={'flex'} alignItems={'center'}>
        <Avatar src={'/imgs/module/extract.png'} mr={2} w={'20px'} objectFit={'cover'} />
        {t('app.Output Field Settings')}
      </ModalHeader>
      <ModalBody>
        <Flex mt={5} alignItems={'center'}>
          <Box flex={'0 0 70px'}>Field type</Box>
          <MySelect
            w={'288px'}
            list={typeSelectList}
            value={getValues('valueType')}
            onchange={(e: any) => {
              setValue('valueType', e);
              setRefresh(!refresh);
            }}
          />
        </Flex>
        <Flex mt={5} alignItems={'center'}>
          <Box flex={'0 0 70px'}>Field name</Box>
          <Input
            placeholder="reservation field/sql statement..."
            {...register('label', { required: 'The field name cannot be empty' })}
          />
        </Flex>

        <Flex mt={5} alignItems={'center'}>
          <Box flex={'0 0 70px'}>Field key</Box>
          <Input
            placeholder="appointment/sql"
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

export default React.memo(SetInputFieldModal);
