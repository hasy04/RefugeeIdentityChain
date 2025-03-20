import localforage from "localforage";
import { User, IdentityDocument } from "@shared/schema";
import { apiRequest } from "./queryClient";

const USERS_STORE = "offline_users";
const DOCUMENTS_STORE = "offline_documents";
const SYNC_QUEUE = "sync_queue";

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  type: 'user' | 'document';
  data: any;
  timestamp: number;
}

export const offlineStorage = {
  async saveUser(user: User) {
    const users = await this.getUsers();
    users.push(user);
    await localforage.setItem(USERS_STORE, users);
    await this.addToSyncQueue({
      id: crypto.randomUUID(),
      operation: 'create',
      type: 'user',
      data: user,
      timestamp: Date.now()
    });
  },

  async getUsers(): Promise<User[]> {
    const users = await localforage.getItem<User[]>(USERS_STORE);
    return users || [];
  },

  async saveDocument(document: IdentityDocument) {
    const documents = await this.getDocuments();
    documents.push(document);
    await localforage.setItem(DOCUMENTS_STORE, documents);
    await this.addToSyncQueue({
      id: crypto.randomUUID(),
      operation: 'create',
      type: 'document',
      data: document,
      timestamp: Date.now()
    });
  },

  async getDocuments(): Promise<IdentityDocument[]> {
    const documents = await localforage.getItem<IdentityDocument[]>(DOCUMENTS_STORE);
    return documents || [];
  },

  async addToSyncQueue(item: SyncQueueItem) {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await localforage.setItem(SYNC_QUEUE, queue);
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const queue = await localforage.getItem<SyncQueueItem[]>(SYNC_QUEUE);
    return queue || [];
  },

  async sync() {
    try {
      const queue = await this.getSyncQueue();
      if (queue.length === 0) return true;

      // Sort by timestamp to maintain operation order
      queue.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of queue) {
        try {
          if (item.type === 'user') {
            await apiRequest('POST', '/api/users/sync', item.data);
          } else {
            await apiRequest('POST', '/api/documents/sync', item.data);
          }
          // Remove synced item from queue
          const updatedQueue = await this.getSyncQueue();
          const filteredQueue = updatedQueue.filter(i => i.id !== item.id);
          await localforage.setItem(SYNC_QUEUE, filteredQueue);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          // Keep item in queue for retry
          continue;
        }
      }
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  },

  async clearStorage() {
    await Promise.all([
      localforage.removeItem(USERS_STORE),
      localforage.removeItem(DOCUMENTS_STORE),
      localforage.removeItem(SYNC_QUEUE)
    ]);
  }
};