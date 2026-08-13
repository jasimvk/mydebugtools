import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertWorkspaceAccess } from '@/lib/workspaces';

const writableRoles = ['owner', 'admin'] as const;
const allowedMemberRoles = ['admin', 'developer', 'viewer'] as const;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = new URL(request.url).searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const membership = await assertWorkspaceAccess(userId, workspaceId);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('workspace_members')
      .select('id, role, status, created_at, users (id, email, name, image)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading workspace members:', error);
      return NextResponse.json({ error: 'Failed to load members' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error loading workspace members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { workspaceId, email, role = 'developer' } = await request.json();

    if (!workspaceId || !email) {
      return NextResponse.json({ error: 'Workspace ID and email are required' }, { status: 400 });
    }

    if (!allowedMemberRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const membership = await assertWorkspaceAccess(userId, workspaceId, [...writableRoles]);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, image')
      .eq('email', String(email).trim().toLowerCase())
      .maybeSingle();

    if (userError) {
      console.error('Error finding user:', userError);
      return NextResponse.json({ error: 'Failed to find user' }, { status: 500 });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User must sign in once before they can be added to a workspace' }, { status: 404 });
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .upsert({
        workspace_id: workspaceId,
        user_id: targetUser.id,
        role,
        status: 'active',
      }, {
        onConflict: 'workspace_id,user_id',
      })
      .select('id, role, status, created_at')
      .single();

    if (memberError) {
      console.error('Error adding workspace member:', memberError);
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }

    return NextResponse.json({ ...member, user: targetUser }, { status: 201 });
  } catch (error) {
    console.error('Error adding workspace member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
