import {
  FlowBodyItemTypeEnum,
  FlowInputItemTypeEnum,
  FlowOutputItemTypeEnum,
  FlowValueTypeEnum
} from '@/constants/flow';
import { Connection } from 'reactflow';
import type { AppModuleItemType } from './app';
import { FlowModuleTypeEnum } from '@/constants/flow';

export type FlowModuleItemChangeProps = {
  moduleId: string;
  type: 'inputs' | 'outputs' | 'addInput' | 'delInput';
  key: string;
  value: any;
};

export type FlowInputItemType = {
  key: string; // field name
  value?: any;
  valueType?: `${FlowValueTypeEnum}`;
  type: `${FlowInputItemTypeEnum}`;
  label: string;
  edit?: boolean;
  connected?: boolean;
  description?: string;
  placeholder?: string;
  max?: number;
  min?: number;
  step?: number;
  required?: boolean;
  list?: { label: string; value: any }[];
  markList?: { label: string; value: any }[];
};

export type FlowOutputTargetItemType = {
  moduleId: string;
  key: string;
};
export type FlowOutputItemType = {
  key: string; // field name
  label?: string;
  edit?: boolean;
  description?: string;
  valueType?: `${FlowValueTypeEnum}`;
  type?: `${FlowOutputItemTypeEnum}`;
  targets: FlowOutputTargetItemType[];
};

export type FlowModuleTemplateType = {
  logo: string;
  name: string;
  description?: string;
  intro: string;
  flowType: `${FlowModuleTypeEnum}`;
  showStatus?: boolean;
  inputs: FlowInputItemType[];
  outputs: FlowOutputItemType[];
};
export type FlowModuleItemType = FlowModuleTemplateType & {
  moduleId: string;
  onChangeNode: (e: FlowModuleItemChangeProps) => void;
  onDelNode: (id: string) => void;
  onCopyNode: (id: string) => void;
  onCollectionNode: (id: string) => void;
  onDelEdge: ({
    moduleId,
    sourceHandle,
    targetHandle
  }: {
    moduleId: string;
    sourceHandle?: string | undefined;
    targetHandle?: string | undefined;
  }) => void;
};
