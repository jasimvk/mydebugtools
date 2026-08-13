import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertWorkspaceAccess, ensurePersonalWorkspace, getWritableWorkspaceId } from '@/lib/workspaces';

// GET /api/collections - Get all collections for the current user
export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const requestedWorkspaceId = new URL(request.url).searchParams.get('workspaceId');
    const workspace = requestedWorkspaceId
      ? { id: requestedWorkspaceId }
      : await ensurePersonalWorkspace(userId);

    const membership = await assertWorkspaceAccess(userId, workspace.id);
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: collections, error } = await supabaseAdmin
      .from('api_collections')
      .select(`
        *,
        api_requests (*)
      `)
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }

    return NextResponse.json(collections || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, description, color, workspaceId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const writableWorkspaceId = await getWritableWorkspaceId(userId, workspaceId);
    if (!writableWorkspaceId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: collection, error } = await supabaseAdmin
      .from('api_collections')
      .insert({
        user_id: userId,
        workspace_id: writableWorkspaceId,
        name,
        description,
        color: color || '#0969da',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
    }

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/collections?id=xxx - Delete a collection
export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('id');
    const workspaceId = searchParams.get('workspaceId');

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    if (workspaceId) {
      const membership = await assertWorkspaceAccess(userId, workspaceId, ['owner', 'admin', 'developer']);
      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let deleteQuery = supabaseAdmin
      .from('api_collections')
      .delete()
      .eq('id', collectionId);

    if (workspaceId) {
      deleteQuery = deleteQuery.eq('workspace_id', workspaceId);
    } else {
      deleteQuery = deleteQuery.eq('user_id', userId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting collection:', error);
      return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
