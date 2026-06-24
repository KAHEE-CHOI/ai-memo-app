import { Memo, MemoFormData } from '@/types/memo'

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  const errorBody = (await response.json().catch(() => null)) as {
    error?: string
  } | null

  throw new Error(errorBody?.error ?? '요청 처리 중 오류가 발생했습니다.')
}

export const memoApi = {
  getMemos: async (): Promise<Memo[]> => {
    const response = await fetch('/api/memos')
    return handleResponse<Memo[]>(response)
  },

  addMemo: async (memo: Memo): Promise<Memo> => {
    const response = await fetch('/api/memos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memo),
    })

    return handleResponse<Memo>(response)
  },

  updateMemo: async (id: string, formData: MemoFormData): Promise<Memo> => {
    const response = await fetch(`/api/memos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    return handleResponse<Memo>(response)
  },

  deleteMemo: async (id: string): Promise<void> => {
    const response = await fetch(`/api/memos/${id}`, {
      method: 'DELETE',
    })

    await handleResponse<void>(response)
  },
}
