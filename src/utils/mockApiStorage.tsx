export interface MockApi {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
    interceptorId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  class MockApiStorage {
    private dbName = 'api-interceptor-mocks';
    private version = 1;
    private storeName = 'mockApis';
  
    private async openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('interceptorId', 'interceptorId', { unique: false });
          }
        };
      });
    }
  
    async getAllMockApis(): Promise<MockApi[]> {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  
    async getMockApisByInterceptor(interceptorId: string): Promise<MockApi[]> {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('interceptorId');
        const request = index.getAll(interceptorId);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  
    async saveMockApi(mockApi: MockApi): Promise<void> {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(mockApi);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  
    async deleteMockApi(id: string): Promise<void> {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  
    async findMatchingMockApi(interceptorId: string, method: string, url: string): Promise<MockApi | null> {
      const mockApis = await this.getMockApisByInterceptor(interceptorId);
      const activeMocks = mockApis.filter(mock => mock.isActive);
      
      for (const mock of activeMocks) {
        if (mock.method.toLowerCase() === method.toLowerCase() && this.urlMatches(mock.url, url)) {
          return mock;
        }
      }
      
      return null;
    }
  
    private urlMatches(pattern: string, url: string): boolean {
      // Simple pattern matching - can be enhanced with regex support
      const patternRegex = pattern
        .replace(/\{[^}]+\}/g, '[^/]+') // Replace {param} with regex
        .replace(/\*/g, '.*'); // Replace * with regex
      
      const regex = new RegExp(`^${patternRegex}$`);
      return regex.test(url);
    }
  }
  
  export const mockApiStorage = new MockApiStorage();