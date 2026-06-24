import { NextRequest, NextResponse } from 'next/server'
import { Memo } from '@/types/memo'
import {
  getSupabaseServerClient,
  memoToRow,
  MemoRow,
  rowToMemo,
} from '@/utils/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/memos error:', error)
      return NextResponse.json(
        { error: '메모 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    const memos = (data as MemoRow[]).map(rowToMemo)
    return NextResponse.json(memos)
  } catch (error) {
    console.error('GET /api/memos error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모 목록을 불러오는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const memo = (await request.json()) as Memo

    if (!memo.id || !memo.title?.trim()) {
      return NextResponse.json(
        { error: '메모 ID와 제목은 필수입니다.' },
        { status: 400 }
      )
    }

    const row = memoToRow(memo)

    const { data, error } = await supabase
      .from('memos')
      .insert(row)
      .select('*')
      .single()

    if (error) {
      console.error('POST /api/memos error:', error)
      return NextResponse.json(
        { error: '메모를 저장하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(rowToMemo(data as MemoRow), { status: 201 })
  } catch (error) {
    console.error('POST /api/memos error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모를 저장하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
