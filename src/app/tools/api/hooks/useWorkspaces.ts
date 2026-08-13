import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface ApiWorkspace {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  plan: string;
}

const ACTIVE_WORKSPACE_KEY = 'debugtools-active-workspace-id';

export function useWorkspaces(privateMode = false) {
  const { data: session } = useSession();
  const [workspaces, setWorkspaces] = useState<ApiWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0] || null,
    [activeWorkspaceId, workspaces]
  );

  const setActiveWorkspaceId = (workspaceId: string) => {
    setActiveWorkspaceIdState(workspaceId);
    if (!privateMode) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
    }
  };

  const loadWorkspaces = async () => {
    if (!session?.user || privateMode) {
      setWorkspaces([]);
      setActiveWorkspaceIdState('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/workspaces');
      if (!response.ok) {
        throw new Error('Failed to load workspaces');
      }

      const data = await response.json();
      const loadedWorkspaces: ApiWorkspace[] = data.workspaces || [];
      const storedWorkspaceId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      const nextActiveId = loadedWorkspaces.some((workspace) => workspace.id === storedWorkspaceId)
        ? storedWorkspaceId || ''
        : data.activeWorkspaceId || loadedWorkspaces[0]?.id || '';

      setWorkspaces(loadedWorkspaces);
      setActiveWorkspaceIdState(nextActiveId);
      if (nextActiveId) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, nextActiveId);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading workspaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string) => {
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create workspace');
    }

    const workspace = await response.json();
    setWorkspaces((current) => [...current, workspace]);
    setActiveWorkspaceId(workspace.id);
    return workspace as ApiWorkspace;
  };

  useEffect(() => {
    loadWorkspaces();
  }, [session?.user, privateMode]);

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    isLoading,
    error,
    setActiveWorkspaceId,
    loadWorkspaces,
    createWorkspace,
  };
}
