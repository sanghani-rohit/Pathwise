import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== Complete Topic API Called ===')

  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get request body
    const body = await request.json()
    const {
      roadmapId,
      topicId,
      topicTitle,
      skill,
      timeSpentMinutes
    } = body

    if (!roadmapId || !topicId || !topicTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: roadmapId, topicId, topicTitle' },
        { status: 400 }
      )
    }

    console.log('Marking topic as complete:', {
      userId,
      roadmapId,
      topicId,
      topicTitle
    })

    // Check if topic is already marked as complete
    const { data: existing, error: checkError } = await supabase
      .from('learning_path_steps')
      .select('id, completed')
      .eq('user_id', userId)
      .eq('roadmap_id', roadmapId)
      .eq('topic_id', topicId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing progress:', checkError)
    }

    if (existing) {
      // Update existing record
      if (existing.completed) {
        return NextResponse.json({
          success: true,
          message: 'Topic already completed',
          alreadyCompleted: true
        })
      }

      const { data: updated, error: updateError } = await supabase
        .from('learning_path_steps')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_minutes: timeSpentMinutes || 0
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating progress:', updateError)
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        )
      }

      console.log('Topic marked as complete (updated):', updated.id)

      return NextResponse.json({
        success: true,
        message: 'Topic marked as complete',
        stepId: updated.id,
        completedAt: updated.completed_at
      })
    } else {
      // Insert new record
      const { data: inserted, error: insertError } = await supabase
        .from('learning_path_steps')
        .insert({
          user_id: userId,
          roadmap_id: roadmapId,
          topic_id: topicId,
          topic_title: topicTitle,
          skill: skill || '',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_minutes: timeSpentMinutes || 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting progress:', insertError)
        return NextResponse.json(
          { error: 'Failed to save progress' },
          { status: 500 }
        )
      }

      console.log('Topic marked as complete (inserted):', inserted.id)

      return NextResponse.json({
        success: true,
        message: 'Topic marked as complete',
        stepId: inserted.id,
        completedAt: inserted.completed_at
      })
    }

  } catch (error: any) {
    console.error('=== ERROR IN COMPLETE TOPIC API ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Failed to mark topic as complete',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch progress for a specific roadmap
export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Get roadmapId from query params
    const { searchParams } = new URL(request.url)
    const roadmapId = searchParams.get('roadmapId')

    if (!roadmapId) {
      return NextResponse.json(
        { error: 'Missing roadmapId parameter' },
        { status: 400 }
      )
    }

    // Fetch all completed topics for this roadmap
    const { data: progress, error: progressError } = await supabase
      .from('learning_path_steps')
      .select('*')
      .eq('user_id', userId)
      .eq('roadmap_id', roadmapId)
      .eq('completed', true)
      .order('completed_at', { ascending: true })

    if (progressError) {
      console.error('Error fetching progress:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      roadmapId,
      completedTopics: progress || [],
      totalCompleted: progress?.length || 0
    })

  } catch (error: any) {
    console.error('=== ERROR IN GET PROGRESS API ===')
    console.error('Error message:', error.message)

    return NextResponse.json(
      {
        error: 'Failed to fetch progress',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
