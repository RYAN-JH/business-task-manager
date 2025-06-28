import { NextRequest, NextResponse } from 'next/server';
import { MasterProfileService } from '@/lib/master-profile-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const masterProfile = await MasterProfileService.loadMasterProfile(userId);
    
    if (!masterProfile) {
      return NextResponse.json({ error: 'Master profile not found' }, { status: 404 });
    }

    // Return read-only master profile data
    return NextResponse.json({
      profile: {
        userId: masterProfile.userId,
        version: masterProfile.version,
        lastUpdated: masterProfile.lastUpdated,
        profileQuality: masterProfile.profileQuality,
        writingStyle: masterProfile.writingStyle,
        personalizationInsights: masterProfile.personalizationInsights,
        contextMemory: masterProfile.contextMemory,
        learnedPatterns: masterProfile.learnedPatterns,
        businessProfile: masterProfile.businessProfile
      },
      stats: {
        totalMessages: masterProfile.writingStyle.totalMessagesAnalyzed,
        dataRichness: masterProfile.profileQuality.dataRichness,
        consistencyScore: masterProfile.profileQuality.consistencyScore,
        patternCount: Object.keys(masterProfile.learnedPatterns).length,
        personalizationPoints: Object.keys(masterProfile.personalizationInsights).length
      }
    });
  } catch (error) {
    console.error('Master profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}