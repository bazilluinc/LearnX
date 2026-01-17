
const DB_NAME = 'LearnX_Mastery_DB';
const STORE_NAME = 'offline_content';
const PROGRESS_STORE = 'user_progress';
const SYLLABUS_STORE = 'course_syllabi';
const DB_VERSION = 4;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) db.createObjectStore(PROGRESS_STORE);
      if (!db.objectStoreNames.contains(SYLLABUS_STORE)) db.createObjectStore(SYLLABUS_STORE);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const setOfflineItem = async (key: string, value: any): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(value, key);
};

export const getOfflineItem = async <T>(key: string): Promise<T | null> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T || null);
    request.onerror = () => resolve(null);
  });
};

export const saveCourseSyllabus = async (courseId: string, modules: any): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(SYLLABUS_STORE, 'readwrite');
  tx.objectStore(SYLLABUS_STORE).put(modules, courseId);
};

export const getCourseSyllabus = async (courseId: string): Promise<any | null> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction(SYLLABUS_STORE, 'readonly').objectStore(SYLLABUS_STORE).get(courseId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
};

export const saveModuleProgress = async (userId: string, courseId: string, moduleId: string, progress: any): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(PROGRESS_STORE, 'readwrite');
  tx.objectStore(PROGRESS_STORE).put(progress, `${userId}_${courseId}_${moduleId}`);
};

export const getModuleProgress = async (userId: string, courseId: string, moduleId: string): Promise<any | null> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const request = db.transaction(PROGRESS_STORE, 'readonly').objectStore(PROGRESS_STORE).get(`${userId}_${courseId}_${moduleId}`);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
};
