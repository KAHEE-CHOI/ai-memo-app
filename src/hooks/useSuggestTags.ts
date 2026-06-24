'use client'

import { useCallback, useState } from 'react'
import { stripMarkdown } from '@/utils/stripMarkdown'

interface SuggestTagsResponse {
  tags?: string[]
  error?: string
}

export const useSuggestTags = () => {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setSuggestedTags([])
    setError(null)
    setIsLoading(false)
  }, [])

  const suggestTags = useCallback(async (title: string, content: string) => {
    setIsLoading(true)
    setError(null)
    setSuggestedTags([])

    try {
      const response = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: stripMarkdown(content),
        }),
      })

      const data = (await response.json()) as SuggestTagsResponse

      if (!response.ok) {
        throw new Error(data.error ?? '태그 추천 요청에 실패했습니다.')
      }

      if (!data.tags || data.tags.length === 0) {
        throw new Error('추천 태그를 받지 못했습니다.')
      }

      setSuggestedTags(data.tags)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : '태그 추천 중 알 수 없는 오류가 발생했습니다.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    suggestedTags,
    isLoading,
    error,
    suggestTags,
    reset,
  }
}
