'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import { memoApi } from '@/utils/memoApi'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    let isMounted = true

    const loadMemos = async () => {
      setLoading(true)
      try {
        const loadedMemos = await memoApi.getMemos()
        if (isMounted) {
          setMemos(loadedMemos)
        }
      } catch (error) {
        console.error('Failed to load memos:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMemos()

    return () => {
      isMounted = false
    }
  }, [])

  // 메모 생성
  const createMemo = useCallback((formData: MemoFormData): Memo => {
    const newMemo: Memo = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setMemos(prev => [newMemo, ...prev])

    memoApi.addMemo(newMemo).catch(error => {
      console.error('Failed to create memo:', error)
      setMemos(prev => prev.filter(memo => memo.id !== newMemo.id))
    })

    return newMemo
  }, [])

  // 메모 업데이트
  const updateMemo = useCallback((id: string, formData: MemoFormData): void => {
    let previousMemo: Memo | undefined

    setMemos(prev => {
      previousMemo = prev.find(memo => memo.id === id)
      if (!previousMemo) {
        return prev
      }

      const updatedMemo: Memo = {
        ...previousMemo,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      return prev.map(memo => (memo.id === id ? updatedMemo : memo))
    })

    if (!previousMemo) {
      return
    }

    memoApi.updateMemo(id, formData).catch(error => {
      console.error('Failed to update memo:', error)
      setMemos(prev =>
        prev.map(memo => (memo.id === id ? previousMemo! : memo))
      )
    })
  }, [])

  // 메모 삭제
  const deleteMemo = useCallback((id: string): void => {
    let deletedMemo: Memo | undefined

    setMemos(prev => {
      deletedMemo = prev.find(memo => memo.id === id)
      return prev.filter(memo => memo.id !== id)
    })

    memoApi.deleteMemo(id).catch(error => {
      console.error('Failed to delete memo:', error)
      if (deletedMemo) {
        setMemos(prev => [deletedMemo!, ...prev])
      }
    })
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback((): void => {
    const previousMemos = memos

    setMemos([])
    setSearchQuery('')
    setSelectedCategory('all')

    Promise.all(previousMemos.map(memo => memoApi.deleteMemo(memo.id))).catch(
      error => {
        console.error('Failed to clear memos:', error)
        setMemos(previousMemos)
      }
    )
  }, [memos])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}
