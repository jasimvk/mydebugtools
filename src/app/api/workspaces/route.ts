import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertWorkspaceAccess, ensurePersonalWorkspace, getUserWorkspaces } from '@/lib/workspaces';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaces = await getUserWorkspaces(userId);
    const personalWorkspace = workspaces[0] || await ensurePersonalWorkspace(userId);

    return NextResponse.json({
      workspaces,
      activeWorkspaceId: personalWorkspace.id,
    });
  } catch (error) {
    console.error('Error loading workspaces:', error);
    return NextResponse.json({ error: 'Failed to load workspaces' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name } = await request.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';

    if (!cleanName) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'workspace';

    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name: cleanName,
        slug: `${slugBase}-${Date.now().toString(36)}`,
        owner_id: userId,
        plan: 'free',
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
    }

    const { error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
      });

    if (memberError) {
      console.error('Error creating workspace membership:', memberError);
      return NextResponse.json({ error: 'Failed to create workspace membership' }, { status: 500 });
    }

    const membership = await assertWorkspaceAccess(userId, workspace.id);
    return NextResponse.json({ ...workspace, role: membership?.role || 'owner' }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
