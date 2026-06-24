import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const MODEL_NAME = 'gemini-2.5-flash-lite'

interface SummarizeRequestBody {
  title: string
  content: string
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

    const body = (await request.json()) as SummarizeRequestBody
    const { title, content } = body

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json(
        { error: '요약할 메모 내용이 없습니다.' },
        { status: 400 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `다음 메모를 한국어로 3~5문장으로 간결하게 요약해주세요. 핵심 내용과 중요한 포인트를 포함해주세요.

제목: ${title}

내용:
${content}`

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    })

    const summary = response.text?.trim()

    if (!summary) {
      return NextResponse.json(
        { error: '요약 결과를 생성하지 못했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: '메모 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
