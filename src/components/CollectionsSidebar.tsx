import React, { useState } from 'react';
import { Plus, Upload, ChevronRight, ChevronDown, Folder, FolderOpen, Globe } from 'lucide-react';
import { useApiCollections } from '../contexts/ApiCollectionsContext';
import { useLoader } from '../contexts/LoaderContext';

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
  onSubmit: (curl: string, collectionId: number) => void;
  collections: Array<{ id?: number; name: string }>;
  loading: boolean;
}

const ImportCurlModal: React.FC<ImportCurlModalProps> = ({ isOpen, onClose, onSubmit, collections, loading }) => {
  const [curl, setCurl] = useState('');
  const [collectionId, setCollectionId] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (curl.trim() && collectionId) {
      onSubmit(curl.trim(), collectionId);
      setCurl('');
      setCollectionId('');
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
  } = useApiCollections();
  const { showLoader, hideLoader } = useLoader();
  
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [isImportCurlOpen, setIsImportCurlOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNewCollection = async (name: string) => {
    await addCollection(name);
  };

  const handleImportCurl = async (curl: string, collectionId: number) => {
    setImportLoading(true);
    try {
      await importCurlToCollection(curl, collectionId);
      setIsImportCurlOpen(false);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-row space-x-2">
            <button
              onClick={() => setIsNewCollectionOpen(true)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Collection
            </button>
            <button
              onClick={() => setIsImportCurlOpen(true)}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Upload className="w-4 h-4 mr-2" />
              cURL
            </button>
          </div>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto">
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
                      
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full ml-2 transition-all duration-200 group-hover:bg-gray-300 dark:group-hover:bg-gray-500">
                        {collectionApis.length}
                      </span>
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
                                  showLoader();
                                  selectCollection(collection.id!);
                                  setTimeout(() => {
                                    selectApi(api.id!);
                                    setTimeout(hideLoader, 600);
                                  }, 0);
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
                                      {unsavedApiIds.has(api.id!) && (
                                        <span className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse align-middle" style={{ boxShadow: '0 0 2px 0.5px #fb923c' }} title="Unsaved changes" />
                                      )}
                                    </span>
                                  </div>
                                </div>
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

      {/* Modals */}
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
    </>
  );
};

export default CollectionsSidebar;