import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/requests - Create a new request in a collection
export async function POST(request: Request) {
  try {
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

    const { error } = await supabaseAdmin
      .from('api_requests')
      .delete()
      .eq('id', requestId)
      .eq('user_id', userId);

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
