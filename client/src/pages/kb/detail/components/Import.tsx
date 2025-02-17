import React, { useState } from 'react';
import { Box, type BoxProps, Flex, Textarea, useTheme } from '@chakra-ui/react';
import MyRadio from '@/components/Radio/index';
import dynamic from 'next/dynamic';

import ManualImport from './Import/Manual';

const ChunkImport = dynamic(() => import('./Import/Chunk'), {
  ssr: true
});
const QAImport = dynamic(() => import('./Import/QA'), {
  ssr: true
});
const CsvImport = dynamic(() => import('./Import/Csv'), {
  ssr: true
});

enum ImportTypeEnum {
  manual = 'manual',
  index = 'index',
  qa = 'qa',
  csv = 'csv'
}

const ImportData = ({ kbId }: { kbId: string }) => {
  const theme = useTheme();
  const [importType, setImportType] = useState<`${ImportTypeEnum}`>(ImportTypeEnum.manual);
  const TitleStyle: BoxProps = {
    fontWeight: 'bold',
    fontSize: ['md', 'xl'],
    mb: [3, 5]
  };

  return (
    <Flex flexDirection={'column'} h={'100%'} pt={[1, 5]}>
      <Box {...TitleStyle} px={[4, 8]}>
        Data import method
      </Box>
      <Box pb={[5, 7]} px={[4, 8]} borderBottom={theme.borders.base}>
        <MyRadio
          gridTemplateColumns={['repeat(1,1fr)', 'repeat(2, 350px)']}
          list={[
            {
              icon: 'manualImport',
              title: 'Manual input',
              desc: 'Manually enter the question and answer pair, which is the most accurate data',
              value: ImportTypeEnum.manual
            },
            {
              icon: 'indexImport',
              title: 'Direct segment',
              desc: 'Select a text file and process it directly in segments',
              value: ImportTypeEnum.index
            },
            {
              icon: 'qaImport',
              title: 'QA Split',
              desc: 'Select a text file and let the large model automatically generate question and answer pairs',
              value: ImportTypeEnum.qa
            },
            {
              icon: 'csvImport',
              title: 'CSV Import',
              desc: 'Import question and answer pairs in batches, which is the most accurate data',
              value: ImportTypeEnum.csv
            }
          ]}
          value={importType}
          onChange={(e) => setImportType(e as `${ImportTypeEnum}`)}
        />
      </Box>

      <Box flex={'1 0 0'} h={0}>
        {importType === ImportTypeEnum.manual && <ManualImport kbId={kbId} />}
        {importType === ImportTypeEnum.index && <ChunkImport kbId={kbId} />}
        {importType === ImportTypeEnum.qa && <QAImport kbId={kbId} />}
        {importType === ImportTypeEnum.csv && <CsvImport kbId={kbId} />}
      </Box>
    </Flex>
  );
};

export default ImportData;
