import React, { useState } from 'react';
import {
  Box,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Switch,
  Input,
  Grid,
  FormControl,
  useTheme
} from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import { VariableInputEnum } from '@/constants/app';
import type { VariableItemType } from '@/types/app';
import MyIcon from '@/components/Icon';
import { useForm } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
import MyModal from '@/components/MyModal';

const VariableTypeList = [
  { label: 'text', icon: 'settingLight', key: VariableInputEnum.input },
  { label: 'Drop-down radio selection', icon: 'settingLight', key: VariableInputEnum.select }
];

export type VariableFormType = {
  variable: VariableItemType;
};

const VariableEditModal = ({
  defaultVariable,
  onClose,
  onSubmit
}: {
  defaultVariable: VariableItemType;
  onClose: () => void;
  onSubmit: (data: VariableFormType) => void;
}) => {
  const theme = useTheme();
  const [refresh, setRefresh] = useState(false);

  const { reset, getValues, setValue, register, control, handleSubmit } = useForm<VariableFormType>(
    {
      defaultValues: {
        variable: defaultVariable
      }
    }
  );
  const {
    fields: selectEnums,
    append: appendEnums,
    remove: removeEnums
  } = useFieldArray({
    control,
    name: 'variable.enums'
  });

  return (
    <MyModal isOpen={true} onClose={onClose}>
      <ModalHeader display={'flex'}>
        <MyIcon name={'variable'} mr={2} w={'24px'} color={'#FF8A4C'} />
        Variable settings
      </ModalHeader>
      <ModalBody>
        <Flex alignItems={'center'}>
          <Box w={'70px'}>Required</Box>
          <Switch {...register('variable.required')} />
        </Flex>
        <Flex mt={5} alignItems={'center'}>
          <Box w={'80px'}>Variable name</Box>
          <Input {...register('variable.label', { required: 'Variable name cannot be empty' })} />
        </Flex>
        <Flex mt={5} alignItems={'center'}>
          <Box w={'80px'}>variable key</Box>
          <Input {...register('variable.key', { required: 'Variable key cannot be empty' })} />
        </Flex>

        <Box mt={5} mb={2}>
          Field Type
        </Box>
        <Grid gridTemplateColumns={'repeat(2,130px)'} gridGap={4}>
          {VariableTypeList.map((item) => (
            <Flex
              key={item.key}
              px={4}
              py={1}
              border={theme.borders.base}
              borderRadius={'md'}
              cursor={'pointer'}
              {...(item.key === getValues('variable.type')
                ? {
                    bg: 'myWhite.600'
                  }
                : {
                    _hover: {
                      boxShadow: 'md'
                    },
                    onClick: () => {
                      setValue('variable.type', item.key);
                      setRefresh(!refresh);
                    }
                  })}
            >
              <MyIcon name={item.icon as any} w={'16px'} />
              <Box ml={3}>{item.label}</Box>
            </Flex>
          ))}
        </Grid>

        {getValues('variable.type') === VariableInputEnum.input && (
          <>
            <Box mt={5} mb={2}>
              The maximum length
            </Box>
            <Box>
              <NumberInput max={100} min={1} step={1} position={'relative'}>
                <NumberInputField
                  {...register('variable.maxLen', {
                    min: 1,
                    max: 100,
                    valueAsNumber: true
                  })}
                  max={100}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </>
        )}

        {getValues('variable.type') === VariableInputEnum.select && (
          <>
            <Box mt={5} mb={2}>
              options
            </Box>
            <Box>
              {selectEnums.map((item, i) => (
                <Flex key={item.id} mb={2} alignItems={'center'}>
                  <FormControl>
                    <Input
                      {...register(`variable.enums.${i}.value`, {
                        required: 'Option content cannot be empty'
                      })}
                    />
                  </FormControl>
                  <MyIcon
                    ml={3}
                    name={'delete'}
                    w={'16px'}
                    cursor={'pointer'}
                    p={2}
                    borderRadius={'lg'}
                    _hover={{ bg: 'red.100' }}
                    onClick={() => removeEnums(i)}
                  />
                </Flex>
              ))}
            </Box>
            <Button
              variant={'solid'}
              w={'100%'}
              textAlign={'left'}
              leftIcon={<SmallAddIcon />}
              bg={'myGray.100 !important'}
              onClick={() => appendEnums({ value: '' })}
            >
              add option
            </Button>
          </>
        )}
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

export default React.memo(VariableEditModal);

export const defaultVariable: VariableItemType = {
  id: nanoid(),
  key: 'key',
  label: 'label',
  type: VariableInputEnum.input,
  required: true,
  maxLen: 50,
  enums: [{ value: '' }]
};
export const addVariable = () => {
  const newVariable = { ...defaultVariable, key: nanoid(), id: nanoid() };
  return newVariable;
};
