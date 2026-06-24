import { NextRequest, NextResponse } from 'next/server'
import { MemoFormData } from '@/types/memo'
import {
  getSupabaseServerClient,
  MemoRow,
  rowToMemo,
} from '@/utils/supabaseServer'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabaseServerClient()
    const formData = (await request.json()) as MemoFormData

    const { data, error } = await supabase
      .from('memos')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('PATCH /api/memos/[id] error:', error)
      return NextResponse.json(
        { error: '메모를 수정하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: '수정할 메모를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(rowToMemo(data as MemoRow))
  } catch (error) {
    console.error('PATCH /api/memos/[id] error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모를 수정하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabaseServerClient()

    const { error } = await supabase.from('memos').delete().eq('id', id)

    if (error) {
      console.error('DELETE /api/memos/[id] error:', error)
      return NextResponse.json(
        { error: '메모를 삭제하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/memos/[id] error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '메모를 삭제하는 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
