import { getSupabaseAdmin } from './supabase-admin';

export type WorkspaceRole = 'owner' | 'admin' | 'developer' | 'viewer';

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: string;
  created_at: string;
  updated_at: string;
  role?: WorkspaceRole;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'workspace';

export async function ensurePersonalWorkspace(userId: string, name?: string): Promise<WorkspaceRecord> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: existingMembership, error: membershipError } = await supabaseAdmin
    .from('workspace_members')
    .select('role, workspaces (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  const existingWorkspace = existingMembership?.workspaces;
  if (existingWorkspace) {
    return {
      ...(Array.isArray(existingWorkspace) ? existingWorkspace[0] : existingWorkspace),
      role: existingMembership.role,
    };
  }

  const baseName = name?.trim() || 'Personal workspace';
  const slug = `${slugify(baseName)}-${userId.slice(0, 8)}`;

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from('workspaces')
    .insert({
      name: baseName,
      slug,
      owner_id: userId,
      plan: 'free',
    })
    .select()
    .single();

  if (workspaceError) {
    throw workspaceError;
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
    throw memberError;
  }

  await supabaseAdmin
    .from('api_collections')
    .update({ workspace_id: workspace.id })
    .eq('user_id', userId)
    .is('workspace_id', null);

  return { ...workspace, role: 'owner' };
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceRecord[]> {
  const supabaseAdmin = getSupabaseAdmin();
  await ensurePersonalWorkspace(userId);

  const { data, error } = await supabaseAdmin
    .from('workspace_members')
    .select('role, workspaces (*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || [])
    .map((membership: any) => {
      const workspace = Array.isArray(membership.workspaces)
        ? membership.workspaces[0]
        : membership.workspaces;
      return workspace ? { ...workspace, role: membership.role } : null;
    })
    .filter(Boolean);
}

export async function assertWorkspaceAccess(
  userId: string,
  workspaceId: string,
  allowedRoles: WorkspaceRole[] = ['owner', 'admin', 'developer', 'viewer']
) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || !allowedRoles.includes(data.role)) {
    return null;
  }

  return data as { role: WorkspaceRole };
}

export async function getWritableWorkspaceId(userId: string, requestedWorkspaceId?: string | null) {
  const workspace = requestedWorkspaceId
    ? { id: requestedWorkspaceId }
    : await ensurePersonalWorkspace(userId);

  const membership = await assertWorkspaceAccess(userId, workspace.id, ['owner', 'admin', 'developer']);
  if (!membership) {
    return null;
  }

  return workspace.id;
}
