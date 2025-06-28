import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - 메시지 피드백 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, feedback } = body

    if (!messageId || !feedback) {
      return NextResponse.json(
        { error: 'messageId and feedback are required' },
        { status: 400 }
      )
    }

    // 메시지가 존재하고 사용자가 접근 권한이 있는지 확인
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          userId: session.user.id
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // 피드백 생성 또는 업데이트
    const messageFeedback = await prisma.messageFeedback.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id
        }
      },
      update: {
        feedback: feedback.toUpperCase(),
        createdAt: new Date()
      },
      create: {
        messageId,
        userId: session.user.id,
        feedback: feedback.toUpperCase()
      }
    })

    // 학습 인사이트 생성
    await createLearningInsight(session.user.id, message, feedback)

    return NextResponse.json({
      success: true,
      message: '피드백이 저장되었습니다',
      feedback: messageFeedback
    })
  } catch (error) {
    console.error('Feedback creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 학습 인사이트 생성 함수
async function createLearningInsight(userId: string, message: any, feedback: string) {
  try {
    const confidence = feedback === 'VERY_HELPFUL' ? 0.9 : 
                     feedback === 'HELPFUL' ? 0.7 : 0.3

    await prisma.learningInsight.create({
      data: {
        userId,
        category: message.persona || 'general',
        insight: `User provided ${feedback} feedback for ${message.persona || 'general'} persona response`,
        confidence
      }
    })
  } catch (error) {
    console.error('Learning insight creation error:', error)
  }
}

// GET - 사용자의 피드백 분석
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbacks = await prisma.messageFeedback.findMany({
      where: { userId: session.user.id },
      include: {
        message: {
          select: {
            persona: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 피드백 분석
    const analysis = {
      total: feedbacks.length,
      helpful: feedbacks.filter((f: any) => f.feedback === 'HELPFUL').length,
      veryHelpful: feedbacks.filter((f: any) => f.feedback === 'VERY_HELPFUL').length,
      notHelpful: feedbacks.filter((f: any) => f.feedback === 'NOT_HELPFUL').length,
      byPersona: {} as Record<string, any>
    }

    // 페르소나별 분석
    feedbacks.forEach((feedback: any) => {
      const persona = feedback.message.persona || 'general'
      if (!analysis.byPersona[persona]) {
        analysis.byPersona[persona] = {
          total: 0,
          helpful: 0,
          veryHelpful: 0,
          notHelpful: 0
        }
      }
      analysis.byPersona[persona].total++
      
      if (feedback.feedback === 'HELPFUL') analysis.byPersona[persona].helpful++
      else if (feedback.feedback === 'VERY_HELPFUL') analysis.byPersona[persona].veryHelpful++
      else if (feedback.feedback === 'NOT_HELPFUL') analysis.byPersona[persona].notHelpful++
    })

    // 학습 인사이트도 포함
    const learningInsights = await prisma.learningInsight.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ 
      feedbacks, 
      analysis,
      learningInsights,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Feedback analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

