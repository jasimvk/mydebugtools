import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getToolHistorySlug, sanitizeToolHistoryPayload } from '@/lib/tool-history';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_LIMIT = 80;
const MAX_LIMIT = 200;

function getSessionUserId(session: Session | null) {
  return (session?.user as { id?: string } | undefined)?.id;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const toolPath = searchParams.get('toolPath');
    const toolSlug = toolPath ? getToolHistorySlug(toolPath) : searchParams.get('toolSlug');

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('tool_history')
      .select('id, tool_slug, tool_name, tool_path, event_type, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (toolSlug && toolSlug !== 'all') {
      query = query.eq('tool_slug', toolSlug);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      console.error('Error loading tool history:', error);
      return NextResponse.json({ error: 'Failed to load tool history' }, { status: 500 });
    }

    return NextResponse.json({
      history: (data || []).map((entry) => ({
        id: entry.id,
        toolSlug: entry.tool_slug,
        toolName: entry.tool_name,
        toolPath: entry.tool_path,
        eventType: entry.event_type,
        metadata: entry.metadata || {},
        createdAt: entry.created_at,
      })),
    });
  } catch (error) {
    console.error('Error loading tool history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = sanitizeToolHistoryPayload(await request.json().catch(() => ({})));
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tool_history')
      .insert({
        user_id: userId,
        tool_slug: payload.toolSlug,
        tool_name: payload.toolName,
        tool_path: payload.toolPath,
        event_type: payload.eventType,
        metadata: payload.metadata,
      })
      .select('id, tool_slug, tool_name, tool_path, event_type, metadata, created_at')
      .single();

    if (error) {
      console.error('Error saving tool history:', error);
      return NextResponse.json({ error: 'Failed to save tool history' }, { status: 500 });
    }

    return NextResponse.json({
      historyItem: {
        id: data.id,
        toolSlug: data.tool_slug,
        toolName: data.tool_name,
        toolPath: data.tool_path,
        eventType: data.event_type,
        metadata: data.metadata || {},
        createdAt: data.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving tool history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolPath = searchParams.get('toolPath');
    const toolSlug = toolPath ? getToolHistorySlug(toolPath) : searchParams.get('toolSlug');
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('tool_history')
      .delete()
      .eq('user_id', userId);

    if (toolSlug && toolSlug !== 'all') {
      query = query.eq('tool_slug', toolSlug);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing tool history:', error);
      return NextResponse.json({ error: 'Failed to clear tool history' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing tool history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
