import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - 새 메시지 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, type, content, persona, suggestions } = body

    if (!conversationId || !type || !content) {
      return NextResponse.json(
        { error: 'conversationId, type, content are required' },
        { status: 400 }
      )
    }

    // 대화가 사용자 소유인지 확인
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 메시지 생성
    const message = await prisma.message.create({
      data: {
        conversationId,
        type: type.toUpperCase(),
        content,
        persona,
        suggestions: suggestions || []
      }
    })

    // 대화 정보 업데이트
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        messageCount: { increment: 1 },
        updatedAt: new Date()
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}