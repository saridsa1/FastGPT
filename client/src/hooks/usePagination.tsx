import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import type { PagingData } from '../types/index';
import { IconButton, Flex, Box, Input } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';
import { useToast } from './useToast';
import { throttle } from 'lodash';

const thresholdVal = 100;

export const usePagination = <T = any,>({
  api,
  pageSize = 10,
  params = {},
  defaultRequest = true,
  type = 'button',
  onChange
}: {
  api: (data: any) => any;
  pageSize?: number;
  params?: Record<string, any>;
  defaultRequest?: boolean;
  type?: 'button' | 'scroll';
  onChange?: (pageNum: number) => void;
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const maxPage = useMemo(() => Math.ceil(total / pageSize) || 1, [pageSize, total]);

  const { mutate, isLoading } = useMutation({
    mutationFn: async (num: number = pageNum) => {
      try {
        const res: PagingData<T> = await api({
          pageNum: num,
          pageSize,
          ...params
        });
        setPageNum(num);
        res.total !== undefined && setTotal(res.total);
        setData(res.data);
        onChange && onChange(num);
      } catch (error: any) {
        toast({
          title: error?.message || 'Exception in obtaining data',
          status: 'error'
        });
        console.log(error);
      }
      return null;
    }
  });

  const Pagination = useCallback(() => {
    return (
      <Flex alignItems={'center'} justifyContent={'end'}>
        <IconButton
          isDisabled={pageNum === 1}
          icon={<ArrowBackIcon />}
          aria-label={'left'}
          size={'sm'}
          w={'28px'}
          h={'28px'}
          isLoading={isLoading}
          onClick={() => mutate(pageNum - 1)}
        />
        <Flex mx={2} alignItems={'center'}>
          <Input
            defaultValue={pageNum}
            w={'50px'}
            size={'xs'}
            type={'number'}
            min={1}
            max={maxPage}
            onBlur={(e) => {
              const val = +e.target.value;
              if (val === pageNum) return;
              if (val >= maxPage) {
                mutate(maxPage);
              } else if (val < 1) {
                mutate(1);
              } else {
                mutate(+e.target.value);
              }
            }}
            onKeyDown={(e) => {
              // @ts-ignore
              const val = +e.target.value;
              if (val && e.keyCode === 13) {
                if (val === pageNum) return;
                if (val >= maxPage) {
                  mutate(maxPage);
                } else if (val < 1) {
                  mutate(1);
                } else {
                  mutate(val);
                }
              }
            }}
          />
          <Box mx={2}>/</Box>
          {maxPage}
        </Flex>
        <IconButton
          isDisabled={pageNum === maxPage}
          icon={<ArrowForwardIcon />}
          aria-label={'left'}
          size={'sm'}
          isLoading={isLoading}
          w={'28px'}
          h={'28px'}
          onClick={() => mutate(pageNum + 1)}
        />
      </Flex>
    );
  }, [isLoading, maxPage, mutate, pageNum]);

  const ScrollData = useCallback(
    ({ children, ...props }: { children: React.ReactNode }) => {
      const loadText = useMemo(() => {
        if (isLoading) return 'Requesting...';
        if (total <= data.length) return 'all loaded';
        return 'Click to load more';
      }, []);

      return (
        <Box {...props} ref={elementRef} overflow={'overlay'}>
          {children}
          <Box
            mt={2}
            fontSize={'xs'}
            color={'blackAlpha.500'}
            textAlign={'center'}
            cursor={loadText === 'Click to load more' ? 'pointer' : 'default'}
            onClick={() => {
              if (loadText !== 'Click to load more') return;
              mutate(pageNum + 1);
            }}
          >
            {loadText}
          </Box>
        </Box>
      );
    },
    [data.length, isLoading, mutate, pageNum, total]
  );

  useEffect(() => {
    if (!elementRef.current || type !== 'scroll') return;

    const scrolling = throttle((e: Event) => {
      const element = e.target as HTMLDivElement;
      if (!element) return;
      // current scroll position
      const scrollTop = element.scrollTop;
      // visible height
      const clientHeight = element.clientHeight;
      // total content height
      const scrollHeight = element.scrollHeight;
      // Determine whether to scroll to the bottom
      if (scrollTop + clientHeight + thresholdVal >= scrollHeight) {
        mutate(pageNum + 1);
      }
    }, 100);
    elementRef.current.addEventListener('scroll', scrolling);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      elementRef.current?.removeEventListener('scroll', scrolling);
    };
  }, [elementRef, mutate, pageNum, type]);

  useEffect(() => {
    defaultRequest && mutate(1);
  }, []);

  return {
    pageNum,
    pageSize,
    total,
    data,
    isLoading,
    Pagination,
    ScrollData,
    getData: mutate
  };
};
