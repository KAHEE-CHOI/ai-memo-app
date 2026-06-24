import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const MODEL_NAME = 'gemini-2.5-flash-lite'

interface SuggestTagsRequestBody {
  title: string
  content: string
}

const parseTagsFromResponse = (text: string): string[] => {
  const trimmed = text.trim()
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/)
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed

  const parsed: unknown = JSON.parse(jsonText)

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid tags format')
  }

  return parsed
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim().replace(/^#/, ''))
    .filter(tag => tag.length > 0)
    .slice(0, 8)
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' },
        { status: 500 }
      )
    }

    const body = (await request.json()) as SuggestTagsRequestBody
    const { title, content } = body

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json(
        { error: '태그를 추천할 메모 내용이 없습니다.' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `다음 메모의 제목과 내용을 분석하여 핵심 키워드 태그를 5~8개 추천해주세요.

규칙:
- JSON 배열 형식으로만 응답하세요. 예: ["React", "Next.js", "학습"]
- 각 태그는 짧은 단어 또는 짧은 구문으로 작성하세요
- 한국어와 영어를 혼용해도 됩니다
- # 기호는 포함하지 마세요
- 설명이나 다른 텍스트 없이 JSON 배열만 반환하세요

제목: ${title}

내용:
${content}`

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    })

    const responseText = response.text?.trim()

    if (!responseText) {
      return NextResponse.json(
        { error: '태그 추천 결과를 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    let tags: string[]

    try {
      tags = parseTagsFromResponse(responseText)
    } catch {
      return NextResponse.json(
        { error: '태그 추천 결과를 파싱하지 못했습니다.' },
        { status: 500 }
      )
    }

    if (tags.length === 0) {
      return NextResponse.json(
        { error: '추천할 태그를 찾지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Suggest tags API error:', error)
    return NextResponse.json(
      { error: '태그 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
