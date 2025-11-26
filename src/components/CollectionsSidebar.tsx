import React, { useState, useRef } from 'react';
import { Plus, Upload, ChevronRight, ArrowDownToLine, Folder, FolderOpen, Globe, Trash2 } from 'lucide-react';
import { useApiCollections } from '../contexts/ApiCollectionsContext';

const methodColors: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700' },
  POST: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' },
  PUT: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700' },
  DELETE: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-700' },
  PATCH: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-700' },
};

interface NewCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-w-[90vw] animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Create New Collection
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collection Name
              </label>
              <input
                id="collection-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter collection name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ImportCurlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (curl: string, collectionId: number, name: string) => void;
  collections: Array<{ id?: number; name: string }>;
  loading: boolean;
}

const ImportCurlModal: React.FC<ImportCurlModalProps> = ({ isOpen, onClose, onSubmit, collections, loading }) => {
  const [curl, setCurl] = useState('');
  const [collectionId, setCollectionId] = useState<number | ''>('');
  const [name, setName] = useState('Imported API');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (curl.trim() && collectionId) {
      onSubmit(curl.trim(), collectionId, name.trim() || 'Imported API');
      setCurl('');
      setCollectionId('');
      setName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[500px] max-w-[90vw] animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Import cURL Command
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="api-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                id="api-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter API name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Collection
              </label>
              <select
                id="collection-select"
                value={collectionId}
                onChange={(e) => setCollectionId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              >
                <option value="">Select a collection...</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id!}>{col.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="curl-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                cURL Command
              </label>
              <textarea
                id="curl-input"
                value={curl}
                onChange={(e) => setCurl(e.target.value)}
                placeholder="curl 'https://api.example.com/endpoint' -H 'Authorization: Bearer token'"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white font-mono text-sm transition-all duration-200"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!curl.trim() || !collectionId || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center transform hover:scale-105 active:scale-95"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Import
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal for importing a collection
interface ImportCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  loading: boolean;
  error: string | null;
}

interface FormDataItem {
  key: string;
  value: string;
  type?: 'text' | 'file';
  src?: string;
}

const ImportCollectionModal: React.FC<ImportCollectionModalProps> = ({ isOpen, onClose, onImport, loading, error }) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) onImport(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-w-[90vw] animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Import Collection
          </h3>
          <form onSubmit={handleImport}>
            <div className="mb-4">
              <input
                type="file"
                accept="application/json,.json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CollectionsSidebar: React.FC = () => {
  const {
    collections,
    apis,
    selectedCollectionId,
    selectedApiId,
    addCollection,
    selectCollection,
    selectApi,
    importCurlToCollection,
    unsavedApiIds,
    deleteCollection,
  } = useApiCollections();
  // Loader removed - no longer needed

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [isImportCurlOpen, setIsImportCurlOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImportCollectionOpen, setIsImportCollectionOpen] = useState(false);
  const [importCollectionLoading, setImportCollectionLoading] = useState(false);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewCollection = async (name: string) => {
    await addCollection(name);
  };

  const handleImportCurl = async (curl: string, collectionId: number, name: string) => {
    setImportLoading(true);
    try {
      await importCurlToCollection(curl, collectionId, name);
      setIsImportCurlOpen(false);
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportCollection = (collectionId: number) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;
    const collectionApis = apis.filter(api => api.collectionId === collectionId);
    // Build Postman v2.1 collection JSON
    const postmanCollection = {
      info: {
        _postman_id: collection.id?.toString() || '',
        name: collection.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: collectionApis.map(api => ({
        name: api.name,
        request: {
          method: api.method,
          header: Object.entries(api.headers || {}).map(([key, value]) => ({ key, value, type: 'text' })),
          url: (() => {
            try {
              const u = new URL(api.url);
              return {
                raw: api.url,
                protocol: u.protocol.replace(':', ''),
                host: u.hostname.split('.'),
                port: u.port || undefined,
                path: u.pathname.split('/').filter(Boolean),
                query: Array.from(u.searchParams.entries()).map(([key, value]) => ({ key, value })),
              };
            } catch {
              return { raw: api.url };
            }
          })(),
          ...(api.body ? { body: { mode: 'raw', raw: api.body } } : {}),
        },
        response: [],
      })),
    };
    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.replace(/\s+/g, '_')}_postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCollectionFile = async (file: File) => {
    setImportCollectionLoading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      // Always create a new collection for import
      let collectionName = '';
      let apis: any[] = [];
      if (json.info && json.item) {
        // Postman format
        collectionName = json.info.name || 'Imported Collection';
        apis = json.item.map((item: any) => {
          let formData = undefined;
          let body = item.request?.body?.raw || '';
          if (item.request?.body?.mode === 'formdata' && Array.isArray(item.request.body.formdata)) {
            formData = item.request.body.formdata.map((fd: any) => {
              // Determine the type based on the formdata item properties
              let type: 'text' | 'file' = 'text';
              if (fd.type === 'file' || fd.src) {
                type = 'file';
              }
              return {
                key: fd.key,
                value: fd.value || '',
                type: type,
                src: fd.src || undefined
              };
            });
            body = '';
          }
          return {
            name: item.name,
            method: item.request?.method || 'GET',
            url: item.request?.url?.raw || '',
            headers: (item.request?.header || []).reduce((acc: any, h: any) => { acc[h.key] = h.value; return acc; }, {}),
            body,
            params: (item.request?.url?.query || []).reduce((acc: any, q: any) => { acc[q.key] = q.value; return acc; }, {}),
            formData,
            bodyMode: item.request?.body?.mode,
          };
        });
      } else if (json.name && Array.isArray(json.apis)) {
        // Our own format
        collectionName = json.name;
        apis = json.apis.map((api: any) => {
          // Ensure formData has proper type information
          if (api.formData && Array.isArray(api.formData)) {
            api.formData = api.formData.map((fd: any) => ({
              key: fd.key,
              value: fd.value || '',
              type: fd.type || 'text',
              src: fd.src || undefined
            }));
          }
          return api;
        });
      } else {
        throw new Error('Unsupported collection format');
      }
      // Always add a new collection
      const newCollectionId = await addCollection(collectionName);
      for (const api of apis) {
        let curlStr = `curl '${api.url}'${api.method && api.method !== 'GET' ? ` -X ${api.method}` : ''}` +
          Object.entries(api.headers || {}).map(([k, v]) => ` -H '${k}: ${v}'`).join('');
        if (api.formData && Array.isArray(api.formData)) {
          curlStr += api.formData.map((fd: FormDataItem) => {
            if (fd.type === 'file') {
              return ` -F '${fd.key}=@${fd.src || ''}'`;
            } else {
              return ` -F '${fd.key}=${fd.value || ''}'`;
            }
          }).join('');
        } else if (api.body) {
          curlStr += ` -d '${api.body}'`;
        }
        await importCurlToCollection(
          curlStr,
          newCollectionId,
          api.name || 'Imported API',
          api.formData && Array.isArray(api.formData) ? { 
            formData: api.formData.map((fd: FormDataItem) => ({
              key: fd.key,
              value: fd.value,
              type: fd.type,
              src: fd.src
            })),
            bodyMode: api.bodyMode 
          } : undefined
        );
      }
      setImportCollectionLoading(false);
      setIsImportCollectionOpen(false);
      setImportError(null);
    } catch (err: any) {
      setImportError('Failed to import collection: ' + (err.message || 'Unknown error'));
      setImportCollectionLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="w-64 p-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
            style={{
                marginLeft: '-1.4rem',
                position: 'fixed',
                zIndex: 10,
            }}
        >
          <div className="flex flex-row space-x-2">
            <button
              onClick={() => setIsNewCollectionOpen(true)}
              className="flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              <Plus className="w-3 h-3 mr-1" />
              Collection
            </button>
            <button
              onClick={() => setIsImportCurlOpen(true)}
              className="flex items-center justify-center px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
            >
              <Upload className="w-3 h-3 mr-1" />
              cURL
            </button>
            <button
              onClick={() => setIsImportCollectionOpen(true)}
              className="flex items-center justify-center px-2 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
              title="Import Collection"
            >
             <Upload className="w-3 h-3 mr-1" />
              Import
            </button>
          </div>
          {importError && (
            <div className="mt-2 text-xs text-red-500">{importError}</div>
          )}
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto"
        style={{
            marginTop: '3rem',
        }}
        >
          {collections.length === 0 ? (
            <div className="p-4 text-center animate-in fade-in duration-300">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <Folder className="w-8 h-8 mx-auto mb-2" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No collections yet
              </p>
              <button
                onClick={() => setIsNewCollectionOpen(true)}
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors duration-200"
              >
                Create your first collection
              </button>
            </div>
          ) : (
            <div className="py-2">
              {collections.map((collection, index) => {
                const isExpanded = expanded[collection.id!];
                const collectionApis = apis.filter(api => api.collectionId === collection.id);
                const isSelected = selectedCollectionId === collection.id;

                return (
                  <div 
                    key={collection.id} 
                    className="mb-1 animate-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Collection Header */}
                    <div
                      className={`flex items-center px-3 py-2 mx-2 rounded-md cursor-pointer group transition-all duration-300 ease-out ${
                        isSelected 
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        selectCollection(collection.id!);
                        if (!isExpanded) {
                          toggleExpand(collection.id!);
                        }
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(collection.id!);
                        }}
                        className="flex items-center justify-center w-5 h-5 mr-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        <div className={`transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                      
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="transition-all duration-300 ease-out">
                          {isExpanded ? (
                            <FolderOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                          ) : (
                            <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
                          )}
                        </div>
                        <span className="font-medium truncate">{collection.name}</span>
                      </div>
                      
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleExportCollection(collection.id!);
                        }}
                        className="ml-2 p-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        title="Export Collection"
                      >
                        <ArrowDownToLine className="w-4 h-4 text-orange-500" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Delete collection "${collection.name}" and all its APIs?`)) {
                            deleteCollection(collection.id!);
                          }
                        }}
                        className="ml-1 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* API Items with smooth expand/collapse */}
                    <div 
                      className={`ml-6 overflow-hidden transition-all duration-300 ease-out ${
                        isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
                      }`}
                    >
                      <div className="space-y-1">
                        {collectionApis.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 italic animate-in fade-in duration-200">
                            No APIs in this collection
                          </div>
                        ) : (
                          collectionApis.map((api, apiIndex) => {
                            const methodStyle = methodColors[api.method] || methodColors.GET;
                            const isApiSelected = selectedApiId === api.id;

                            return (
                              <div
                                key={api.id}
                                className={`flex items-center px-3 py-2 mx-2 rounded-md cursor-pointer group transition-all duration-300 ease-out animate-in slide-in-from-left ${
                                  isApiSelected
                                    ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 shadow-sm transform scale-[1.02]'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:shadow-sm hover:transform hover:scale-[1.01]'
                                }`}
                                style={{ animationDelay: `${apiIndex * 50}ms` }}
                                onClick={() => {
                                  selectCollection(collection.id!);
                                  selectApi(api.id!);
                                }}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-3 transition-all duration-200 ${methodStyle.bg} ${methodStyle.text} border ${methodStyle.border}`}>
                                    {api.method}
                                  </span>
                                  <div className="flex items-center min-w-0 flex-1">
                                    <Globe className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0 transition-colors duration-200 group-hover:text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {api.name}
                                    </span>
                                  </div>
                                </div>
                                {unsavedApiIds.has(api.id!) && (
                                  <div
                                    className="ml-2 w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0"
                                    style={{ boxShadow: '0 0 2px 0.5px #fb923c' }}
                                    title="Unsaved changes"
                                  />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Render modals at the bottom so they are always present */}
      <NewCollectionModal
        isOpen={isNewCollectionOpen}
        onClose={() => setIsNewCollectionOpen(false)}
        onSubmit={handleNewCollection}
      />
      <ImportCurlModal
        isOpen={isImportCurlOpen}
        onClose={() => setIsImportCurlOpen(false)}
        onSubmit={handleImportCurl}
        collections={collections}
        loading={importLoading}
      />
      <ImportCollectionModal
        isOpen={isImportCollectionOpen}
        onClose={() => { setIsImportCollectionOpen(false); setImportError(null); }}
        onImport={handleImportCollectionFile}
        loading={importCollectionLoading}
        error={importError}
      />
    </>
  );
};

export default CollectionsSidebar;