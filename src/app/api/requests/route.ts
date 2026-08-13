import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { assertWorkspaceAccess } from '@/lib/workspaces';

// POST /api/requests - Create a new request in a collection
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { collectionId, name, method, url, headers, body: requestBody, authConfig, description } = body;

    if (!collectionId || !name || !method || !url) {
      return NextResponse.json(
        { error: 'Collection ID, name, method, and URL are required' },
        { status: 400 }
      );
    }

    const { data: collection, error: collectionError } = await supabaseAdmin
      .from('api_collections')
      .select('id, user_id, workspace_id')
      .eq('id', collectionId)
      .maybeSingle();

    if (collectionError) {
      console.error('Error loading collection for request:', collectionError);
      return NextResponse.json({ error: 'Failed to load collection' }, { status: 500 });
    }

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.workspace_id) {
      const membership = await assertWorkspaceAccess(userId, collection.workspace_id, ['owner', 'admin', 'developer']);
      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (collection.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: apiRequest, error } = await supabaseAdmin
      .from('api_requests')
      .insert({
        collection_id: collectionId,
        user_id: userId,
        name,
        method,
        url,
        headers: headers || [],
        body: requestBody,
        auth_config: authConfig,
        description: description || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating request:', error);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    return NextResponse.json(apiRequest, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/requests?id=xxx - Delete a request
export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const { data: savedRequest, error: requestLoadError } = await supabaseAdmin
      .from('api_requests')
      .select('id, user_id, api_collections (workspace_id)')
      .eq('id', requestId)
      .maybeSingle();

    if (requestLoadError) {
      console.error('Error loading request for delete:', requestLoadError);
      return NextResponse.json({ error: 'Failed to load request' }, { status: 500 });
    }

    if (!savedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const linkedCollection = Array.isArray((savedRequest as any).api_collections)
      ? (savedRequest as any).api_collections[0]
      : (savedRequest as any).api_collections;
    const workspaceId = linkedCollection?.workspace_id;

    if (workspaceId) {
      const membership = await assertWorkspaceAccess(userId, workspaceId, ['owner', 'admin', 'developer']);
      if (!membership) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (savedRequest.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('api_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting request:', error);
      return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
