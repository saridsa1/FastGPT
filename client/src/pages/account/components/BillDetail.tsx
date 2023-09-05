import React from 'react';
import {
  ModalBody,
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import { UserBillType } from '@/types/user';
import dayjs from 'dayjs';
import { BillSourceMap } from '@/constants/user';
import { formatPrice } from '@/utils/user';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'react-i18next';

const BillDetail = ({ bill, onClose }: { bill: UserBillType; onClose: () => void }) => {
  const { t } = useTranslation();

  return (
    <MyModal isOpen={true} onClose={onClose} title={t('user.Bill Detail')}>
      <ModalBody>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>Order number:</Box>
          <Box>{bill.id}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>Generation time:</Box>
          <Box>{dayjs(bill.time).format('YYYY/MM/DD HH:mm:ss')}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>Application name:</Box>
          <Box>{bill.appName}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>Source:</Box>
          <Box>{BillSourceMap[bill.source]}</Box>
        </Flex>
        <Flex alignItems={'center'} pb={4}>
          <Box flex={'0 0 80px'}>Total amount:</Box>
          <Box fontWeight={'bold'}>{bill.total}yuan</Box>
        </Flex>
        <Box pb={4}>
          <Box flex={'0 0 80px'} mb={1}>
            Deduction module
          </Box>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Module name</Th>
                  <Th>AI Model</Th>
                  <Th>Token length</Th>
                  <Th>Fees</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bill.list.map((item, i) => (
                  <Tr key={i}>
                    <Td>{item.moduleName}</Td>
                    <Td>{item.model}</Td>
                    <Td>{item.tokenLen}</Td>
                    <Td>{formatPrice(item.amount)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ModalBody>
    </MyModal>
  );
};

export default BillDetail;
