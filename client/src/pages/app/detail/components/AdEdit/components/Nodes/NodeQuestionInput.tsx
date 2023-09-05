import React from 'react';
import { NodeProps } from 'reactflow';
import { Box } from '@chakra-ui/react';
import NodeCard from '../modules/NodeCard';
import { FlowModuleItemType } from '@/types/flow';
import Container from '../modules/Container';
import { SystemInputEnum } from '@/constants/app';
import { FlowValueTypeEnum } from '@/constants/flow';
import SourceHandle from '../render/SourceHandle';

const QuestionInputNode = ({ data }: NodeProps<FlowModuleItemType>) => {
  return (
    <NodeCard minW={'240px'} {...data}>
      <Container borderTop={'2px solid'} borderTopColor={'myGray.200'} textAlign={'end'}>
        <Box position={'relative'}>
          user question
          <SourceHandle
            handleKey={SystemInputEnum.userChatInput}
            valueType={FlowValueTypeEnum.string}
          />
        </Box>
      </Container>
    </NodeCard>
  );
};
export default React.memo(QuestionInputNode);
