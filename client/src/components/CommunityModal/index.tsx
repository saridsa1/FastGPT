import React from 'react';
import { Button, ModalFooter, ModalBody } from '@chakra-ui/react';
import MyModal from '../MyModal';
import { useTranslation } from 'react-i18next';
import Markdown from '../Markdown';

const md = `
| Exchange group | Assistant |
| ----------------------- | ----------------------- --- |
| ![](https://otnvvf-imgs.oss.laf.run/wxqun300.jpg) | ![](https://otnvvf-imgs.oss.laf.run/wx300.jpg) |
`;

const CommunityModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <MyModal isOpen={true} onClose={onClose} title={t('home.Community')}>
      <ModalBody textAlign={'center'}>
        <Markdown source={md} />
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} onClick={onClose}>
          closure
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default CommunityModal;
