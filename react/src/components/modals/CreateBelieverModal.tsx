import Loading from '@/components/Loading';
import { useWindowInfo } from '@/hooks/useHook';
import { useAntd } from '@/provider/AntdProvider';
import { trpcQuery } from '@/provider/TrpcProvider';
import { useUserStore } from '@/store/useUser';
import { TrpcOutputs } from '@/types/trpc';
import { Button, Checkbox, Form, Input, Modal, Spin, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FormInstance, Table } from 'antd/lib';
import { useMemo, useRef, useState } from 'react';
import { create } from 'zustand';


type CreateBelieverModalStoreType = {
  believerId?: string
  isOpen: boolean
  onOpen: (believerId: string) => void
  onClose: () => void
}

export const useCreateBelieverModalStore = create<CreateBelieverModalStoreType>(
  (set) => ({
    believerId: undefined,
    isOpen: false,
    onOpen: (believerId) => set({ isOpen: true, believerId }),
    onClose: () => set({ isOpen: false }),
  }),
)


function CreateBelieverModal() {
  const { isOpen, onClose, believerId } = useCreateBelieverModalStore()

  const { data } = trpcQuery.believer.findParentIdByBelieverId.useQuery(
    believerId as string,
    {
      enabled: !!believerId,
    },
  )
  console.log(data)

  return (
    <>
      <Modal
        title={'信眾服務'}
        onCancel={onClose}
        open={isOpen}
        width={900}
        centered
        footer={[
          <Button key="ok" type="primary" onClick={onClose}>
            關閉
          </Button>,
        ]}
      ></Modal>
    </>
  )
}

export default CreateBelieverModal