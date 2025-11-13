// src/hooks/index.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api, { workbookAPI, sheetAPI } from '@/types/api.types';
import type {
  PaginatedResponse,
  Workbook,
  WorkbookList,
  SheetList,
} from '@/types';

// ---------- Workbooks list (paginated) ----------
export function useWorkbooks(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['workbooks', params],
    queryFn: async () => {
      const res = await workbookAPI.listPaginated({
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 25,
      });
      return res as PaginatedResponse<WorkbookList>;
    },
  });
}

// ---------- Single workbook (ID IS STRING) ----------
export function useWorkbook(id: string) {
  return useQuery({
    queryKey: ['workbook', id],
    queryFn: () => workbookAPI.get(id),
    enabled: !!id,
  });
}

// ---------- Sheets by workbook (ID IS STRING) ----------
export function useWorkbookSheets(id: string) {
  return useQuery({
    queryKey: ['workbook-sheets', id],
    queryFn: () => sheetAPI.getByWorkbook(id),
    enabled: !!id,
  });
}

// ---------- Processing queue ----------
export function useProcessingQueue() {
  return useQuery({
    queryKey: ['processing-queue'],
    queryFn: () => workbookAPI.getProcessingQueue(),
  });
}

// ---------- Upload (accepts File directly) ----------
export function useUpload() {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => workbookAPI.upload(file, setProgress),
  });

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: (mutation.error as any)?.error || (mutation.error as Error)?.message || null,
    progress,
    workbook: (mutation.data as Workbook) || null,
  };
}
