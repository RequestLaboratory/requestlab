import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Dexie, { Table } from 'dexie';
import { parseCurlCommand } from '../utils/curlParser';

export interface ApiResponse {
  id?: number;
  apiId: number;
  timestamp: number;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface ApiEntry {
  id?: number;
  collectionId: number;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  params: Record<string, string>;
}

export interface Collection {
  id?: number;
  name: string;
}

class ApiDB extends Dexie {
  collections!: Table<Collection, number>;
  apis!: Table<ApiEntry, number>;
  responses!: Table<ApiResponse, number>;
  constructor() {
    super('ApiDB');
    this.version(1).stores({
      collections: '++id, name',
      apis: '++id, collectionId, name',
      responses: '++id, apiId, timestamp',
    });
  }
}

const db = new ApiDB();

interface ApiCollectionsContextType {
  collections: Collection[];
  apis: ApiEntry[];
  selectedCollectionId: number | null;
  selectedApiId: number | null;
  addCollection: (name: string) => Promise<void>;
  selectCollection: (id: number) => void;
  addApi: (api: Omit<ApiEntry, 'id'>) => Promise<void>;
  selectApi: (id: number) => void;
  importCurlToCollection: (curl: string, collectionId: number, name?: string) => Promise<void>;
  updateApi: (api: ApiEntry) => Promise<void>;
  unsavedApiIds: Set<number>;
  markApiUnsaved: (id: number) => void;
  unmarkApiUnsaved: (id: number) => void;
}

const ApiCollectionsContext = createContext<ApiCollectionsContextType | undefined>(undefined);

const useUnsavedApiIds = () => {
  const [unsavedApiIds, setUnsavedApiIds] = useState<Set<number>>(new Set());
  const markApiUnsaved = useCallback((id: number) => {
    setUnsavedApiIds(prev => new Set(prev).add(id));
  }, []);
  const unmarkApiUnsaved = useCallback((id: number) => {
    setUnsavedApiIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  return { unsavedApiIds, markApiUnsaved, unmarkApiUnsaved };
};

export const ApiCollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [apis, setApis] = useState<ApiEntry[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null);
  const unsavedApi = useUnsavedApiIds();

  useEffect(() => {
    db.collections.toArray().then(setCollections);
    db.apis.toArray().then(setApis);
  }, []);

  const addCollection = async (name: string) => {
    const id = await db.collections.add({ name });
    setCollections(await db.collections.toArray());
    setSelectedCollectionId(id);
  };

  const selectCollection = (id: number) => {
    setSelectedCollectionId(id);
    setSelectedApiId(null);
  };

  const addApi = async (api: Omit<ApiEntry, 'id'>) => {
    await db.apis.add(api);
    setApis(await db.apis.toArray());
  };

  const selectApi = (id: number) => {
    setSelectedApiId(id);
  };

  const updateApi = async (api: ApiEntry) => {
    if (!api.id) return;
    await db.apis.update(api.id, { ...api });
    setApis(await db.apis.toArray());
  };

  // Placeholder for cURL import logic
  const importCurlToCollection = async (curl: string, collectionId: number, name?: string) => {
    try {
      const parsed = parseCurlCommand(curl);
      await addApi({
        collectionId,
        name: name || 'Imported API',
        method: parsed.method || 'GET',
        url: parsed.url || '',
        headers: parsed.headers || {},
        body: parsed.body || '',
        params: parsed.queryParams || {},
      });
    } catch (e) {
      console.error('Failed to import cURL:', e);
      // fallback to dummy if parse fails
      await addApi({
        collectionId,
        name: name || 'Imported API',
        method: 'GET',
        url: 'https://example.com',
        headers: {},
        body: '',
        params: {},
      });
    }
  };

  return (
    <ApiCollectionsContext.Provider
      value={{
        collections,
        apis,
        selectedCollectionId,
        selectedApiId,
        addCollection,
        selectCollection,
        addApi,
        selectApi,
        importCurlToCollection,
        updateApi,
        ...unsavedApi,
      }}
    >
      {children}
    </ApiCollectionsContext.Provider>
  );
};

export const useApiCollections = () => {
  const ctx = useContext(ApiCollectionsContext);
  if (!ctx) throw new Error('useApiCollections must be used within ApiCollectionsProvider');
  return ctx;
}; 