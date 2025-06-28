import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 완성도 계산 함수
function calculateCompletionScore(profileData: any): number {
  const totalFields = 50 // 전체 프로필 필드 수 추정
  const filledFields = Object.values(profileData).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  }).length
  
  return Math.round((filledFields / totalFields) * 100)
}

// GET 요청 처리 - 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.extendedProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      // 프로필이 없으면 기본 프로필 생성
      const newProfile = await prisma.extendedProfile.create({
        data: {
          userId: session.user.id,
          completionScore: 0.0
        }
      })
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST 요청 처리 - 프로필 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profileData } = body
    
    if (!profileData) {
      return NextResponse.json(
        { error: '프로필 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

    // 완성도 계산
    const completionScore = calculateCompletionScore(profileData)

    const updatedProfile = await prisma.extendedProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...profileData,
        completionScore,
        lastUpdated: new Date()
      },
      create: {
        userId: session.user.id,
        ...profileData,
        completionScore
      }
    })

    return NextResponse.json({
      success: true,
      message: '프로필이 성공적으로 저장되었습니다.',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT 요청 처리 - 프로필 부분 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { section, data } = body
    
    if (!section || !data) {
      return NextResponse.json(
        { error: '섹션과 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

    // 현재 프로필 가져오기
    let profile = await prisma.extendedProfile.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!profile) {
      // 프로필이 없으면 새로 생성
      profile = await prisma.extendedProfile.create({
        data: {
          userId: session.user.id,
          completionScore: 0.0
        }
      })
    }

    // 특정 섹션만 업데이트
    const updateData = { [section]: data }
    
    // 완성도 재계산
    const profileData = { ...profile, ...updateData }
    const completionScore = calculateCompletionScore(profileData)

    const updatedProfile = await prisma.extendedProfile.update({
      where: { userId: session.user.id },
      data: {
        ...updateData,
        completionScore,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${section} 섹션이 업데이트되었습니다.`,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}