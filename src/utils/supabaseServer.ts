import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Memo } from '@/types/memo'

export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

let supabaseClient: SupabaseClient | null = null

export const getSupabaseServerClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseSecretKey || supabaseSecretKey === 'your_secret_key_here') {
    throw new Error(
      'SUPABASE_URL 또는 SUPABASE_SECRET_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.'
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseClient
}

export const rowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const memoToRow = (memo: Memo): MemoRow => ({
  id: memo.id,
  title: memo.title,
  content: memo.content,
  category: memo.category,
  tags: memo.tags,
  created_at: memo.createdAt,
  updated_at: memo.updatedAt,
})
