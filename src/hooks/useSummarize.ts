'use client'

import { useCallback, useState } from 'react'
import { stripMarkdown } from '@/utils/stripMarkdown'

interface SummarizeResponse {
  summary?: string
  error?: string
}

export const useSummarize = () => {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setSummary(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const summarize = useCallback(async (title: string, content: string) => {
    setIsLoading(true)
    setError(null)
    setSummary(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: stripMarkdown(content),
        }),
      })

      const data = (await response.json()) as SummarizeResponse

      if (!response.ok) {
        throw new Error(data.error ?? '요약 요청에 실패했습니다.')
      }

      if (!data.summary) {
        throw new Error('요약 결과를 받지 못했습니다.')
      }

      setSummary(data.summary)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '요약 중 알 수 없는 오류가 발생했습니다.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    summary,
    isLoading,
    error,
    summarize,
    reset,
  }
}
