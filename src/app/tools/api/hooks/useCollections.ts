import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | 'application/xml' | 'text/xml';
type AuthType = 'none' | 'basic' | 'bearer' | 'apiKey';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface AuthConfig {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
  refreshTokenUrl?: string;
  refreshToken?: string;
  autoRefresh?: boolean;
  tokenExpiry?: number;
  loginUrl?: string;
  loginUsername?: string;
  loginPassword?: string;
  autoLogin?: boolean;
  tokenPath?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  contentType: ContentType;
  authConfig: AuthConfig;
  preRequestScript?: string;
  testScript?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: SavedRequest[];
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export function addRequestToCollections(
  collections: Collection[],
  collectionId: string,
  newRequest: SavedRequest
): Collection[] {
  return collections.map(c => {
    if (c.id === collectionId) {
      return {
        ...c,
        requests: [...c.requests, newRequest],
        updatedAt: Date.now()
      };
    }
    return c;
  });
}

export interface OrphanedRequest {
  collectionId: string;
  request: SavedRequest;
}

// A hand-edited or half-written localStorage value can parse to something that is not
// an array, which would blow up every `collections.map(...)` in the UI.
export function parseStoredCollections(raw: string | null): Collection[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Requests that failed to reach the cloud keep a `local-req-` id inside a cloud
// collection, so the collection-level sync sweep never picks them up.
export function collectOrphanedRequests(collections: Collection[]): OrphanedRequest[] {
  return collections
    .filter((collection) => !collection.id.startsWith('local-'))
    .flatMap((collection) =>
      (Array.isArray(collection.requests) ? collection.requests : [])
        .filter((request) => typeof request?.id === 'string' && request.id.startsWith('local-req-'))
        .map((request) => ({ collectionId: collection.id, request }))
    );
}

function mapCloudCollections(data: any[]): Collection[] {
  return (Array.isArray(data) ? data : []).map((col: any) => ({
    id: col.id,
    name: col.name,
    description: col.description || '',
    color: col.color || '#0969da',
    createdAt: new Date(col.created_at).getTime(),
    updatedAt: new Date(col.updated_at).getTime(),
    requests: (col.api_requests || []).map((req: any) => ({
      id: req.id,
      name: req.name,
      method: req.method as HttpMethod,
      url: req.url,
      headers: req.headers || [],
      body: req.body || '',
      contentType: (req.headers?.find((h: any) => h.key === 'Content-Type')?.value || 'application/json') as ContentType,
      authConfig: req.auth_config || { type: 'none' as AuthType },
      preRequestScript: req.pre_request_script || '',
      testScript: req.test_script || '',
      description: req.description || '',
      createdAt: new Date(req.created_at).getTime(),
      updatedAt: new Date(req.updated_at).getTime(),
    }))
  }));
}

export function useCollections(privateMode = false, workspaceId?: string) {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collections from localStorage
  const loadLocalCollections = () => {
    if (privateMode) {
      setCollections([]);
      return;
    }

    try {
      const stored = localStorage.getItem('api-collections');
      if (stored) {
        setCollections(parseStoredCollections(stored));
      }
    } catch (err) {
      console.error('Error loading local collections:', err);
    }
  };

  // Save collections to localStorage
  const saveLocalCollections = (cols: Collection[]) => {
    if (privateMode) return;

    try {
      localStorage.setItem('api-collections', JSON.stringify(cols));
    } catch (err) {
      console.error('Error saving local collections:', err);
    }
  };

  // Load collections from Supabase (when logged in)
  const loadCollections = async () => {
    if (privateMode) {
      setCollections([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!session?.user) {
      // Load from localStorage if not logged in
      loadLocalCollections();
      setIsLoading(false);
      return;
    }

    if (!workspaceId) {
      setCollections([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First, get any local collections that might exist
      const localCollections = parseStoredCollections(localStorage.getItem('api-collections'));

      // Fetch cloud collections
      const response = await fetch(`/api/collections?workspaceId=${encodeURIComponent(workspaceId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();

      // Transform Supabase data to match our Collection interface
      const cloudCollections = mapCloudCollections(data);

      // Find local-only collections (those with 'local-' prefix that aren't in cloud)
      const localOnlyCollections = localCollections.filter(lc =>
        lc.id.startsWith('local-')
      );
      // Requests whose cloud save failed live on inside an already-synced collection.
      const orphanedRequests = collectOrphanedRequests(localCollections);

      // Sync local collections to cloud
      if (localOnlyCollections.length > 0 || orphanedRequests.length > 0) {
        console.log(`Syncing ${localOnlyCollections.length} local collection(s) and ${orphanedRequests.length} unsynced request(s) to cloud...`);

        for (const localCol of localOnlyCollections) {
          try {
            // Create collection in cloud
            const colResponse = await fetch('/api/collections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: localCol.name,
                description: localCol.description,
                color: localCol.color,
                workspaceId
              })
            });

            if (colResponse.ok) {
              const cloudCol = await colResponse.json();
              
              // Sync all requests in this collection
              for (const req of localCol.requests) {
                try {
                  await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      collectionId: cloudCol.id,
                      name: req.name,
                      method: req.method,
                      url: req.url,
                      headers: req.headers,
                      body: req.body,
                      authConfig: req.authConfig,
                      preRequestScript: req.preRequestScript,
                      testScript: req.testScript,
                      description: req.description
                    })
                  });
                } catch (err) {
                  console.error('Error syncing request:', err);
                }
              }
            }
          } catch (err) {
            console.error('Error syncing collection:', err);
          }
        }

        for (const orphan of orphanedRequests) {
          try {
            await fetch('/api/requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                collectionId: orphan.collectionId,
                name: orphan.request.name,
                method: orphan.request.method,
                url: orphan.request.url,
                headers: orphan.request.headers,
                body: orphan.request.body,
                authConfig: orphan.request.authConfig,
                preRequestScript: orphan.request.preRequestScript,
                testScript: orphan.request.testScript,
                description: orphan.request.description
              })
            });
          } catch (err) {
            console.error('Error syncing unsynced request:', err);
          }
        }

        // Reload to get the synced collections
        const reloadResponse = await fetch(`/api/collections?workspaceId=${encodeURIComponent(workspaceId)}`);
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          const reloadedCollections = mapCloudCollections(reloadData);

          setCollections(reloadedCollections);
          saveLocalCollections(reloadedCollections);
          console.log('✅ Local collections synced successfully!');
        }
      } else {
        // No local collections to sync, just use cloud collections
        setCollections(cloudCollections);
        saveLocalCollections(cloudCollections);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collections');
      // Fall back to local storage on error
      loadLocalCollections();
    } finally {
      setIsLoading(false);
    }
  };

  // Create new collection
  const createCollection = async (name: string, description: string = '', color?: string) => {
    const newCollection: Collection = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || '',
      color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      requests: []
    };

    // If logged in, save to cloud
    if (session?.user && !privateMode && workspaceId) {
      try {
        const response = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            color: newCollection.color,
            workspaceId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create collection');
        }

        const cloudCollection = await response.json();
        
        // Use cloud ID
        newCollection.id = cloudCollection.id;
        newCollection.createdAt = new Date(cloudCollection.created_at).getTime();
        newCollection.updatedAt = new Date(cloudCollection.updated_at).getTime();
      } catch (err) {
        console.error('Error creating collection in cloud:', err);
        // Continue with local ID
      }
    }

    setCollections(prevCollections => {
      const updatedCollections = [...prevCollections, newCollection];
      saveLocalCollections(updatedCollections);
      return updatedCollections;
    });
    return newCollection;
  };

  // Delete collection
  const deleteCollection = async (collectionId: string) => {
    // If logged in and cloud ID, delete from cloud
    if (session?.user && !privateMode && workspaceId && !collectionId.startsWith('local-')) {
      try {
        const response = await fetch(`/api/collections?id=${collectionId}&workspaceId=${encodeURIComponent(workspaceId)}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete collection');
        }
      } catch (err) {
        console.error('Error deleting collection from cloud:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete collection');
        return false;
      }
    }

    setCollections(prevCollections => {
      const updatedCollections = prevCollections.filter(c => c.id !== collectionId);
      saveLocalCollections(updatedCollections);
      return updatedCollections;
    });
    return true;
  };

  // Save request to collection
  const saveRequest = async (
    collectionId: string,
    request: Omit<SavedRequest, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newRequest: SavedRequest = {
      id: `local-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...request,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // If logged in and cloud collection, save to cloud
    if (session?.user && !privateMode && workspaceId && !collectionId.startsWith('local-')) {
      try {
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionId,
            ...request
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save request');
        }

        const savedRequest = await response.json();
        
        // Use cloud ID
        newRequest.id = savedRequest.id;
        newRequest.createdAt = new Date(savedRequest.created_at).getTime();
        newRequest.updatedAt = new Date(savedRequest.updated_at).getTime();
      } catch (err) {
        console.error('Error saving request to cloud:', err);
        // Keep the request locally under its `local-req-` id and tell the user it is
        // not in the cloud yet; the next load sweeps it up.
        setError(
          `${err instanceof Error ? err.message : 'Failed to save request'} - kept locally, it will sync on the next reload.`
        );
      }
    }

    setCollections(prevCollections => {
      const updatedCollections = addRequestToCollections(prevCollections, collectionId, newRequest);
      saveLocalCollections(updatedCollections);
      return updatedCollections;
    });
    return newRequest;
  };

  // Delete request from collection
  const deleteRequest = async (collectionId: string, requestId: string) => {
    // If logged in and cloud request, delete from cloud
    if (session?.user && !privateMode && !requestId.startsWith('local-')) {
      try {
        const response = await fetch(`/api/requests?id=${requestId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete request');
        }
      } catch (err) {
        console.error('Error deleting request from cloud:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete request');
        return false;
      }
    }

    setCollections(prevCollections => {
      const updatedCollections = prevCollections.map(c => {
        if (c.id === collectionId) {
          return {
            ...c,
            requests: c.requests.filter(r => r.id !== requestId),
            updatedAt: Date.now()
          };
        }
        return c;
      });

      saveLocalCollections(updatedCollections);
      return updatedCollections;
    });
    return true;
  };

  // Rename collection (optimistic update)
  const renameCollection = (collectionId: string, newName: string) => {
    setCollections(prevCollections => {
      const updatedCollections = prevCollections.map(c =>
        c.id === collectionId
          ? { ...c, name: newName, updatedAt: Date.now() }
          : c
      );
      saveLocalCollections(updatedCollections);
      return updatedCollections;
    });
    
    // TODO: Add API endpoint for updating collection name if cloud collection
  };

  // Load collections on mount and when session changes
  useEffect(() => {
    loadCollections();
  }, [session?.user, privateMode, workspaceId]);

  return {
    collections,
    isLoading,
    error,
    loadCollections,
    createCollection,
    deleteCollection,
    saveRequest,
    deleteRequest,
    renameCollection,
  };
}
