/**
 * Label Storage Service
 * 
 * Provides access to label projects from the API.
 */

import { Label as LabelType, LabelCollection } from '@/lib/types/label.types';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for stored label projects
export interface SavedProject {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  description?: string;
  label?: Label; // Dodana właściwość label
}

export interface Label {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: LabelElement[];
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabelElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  value?: string;
  color?: string;
  rotation?: number;
  properties?: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Request cache and request tracking for deduplication
const requestCache = new Map();
const pendingRequests = new Map();

export class LabelStorageService {
  // Helper method for network requests with built-in caching and deduplication
  private static async fetchWithCache(url: string, options: RequestInit = {}, skipCache = false): Promise<any> {
    const cacheKey = `${options.method || 'GET'}-${url}-${options.body || ''}`;
    
    // Return from cache if available and not skipping cache
    if (!skipCache && requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey);
    }
    
    // For deduplication - if there's already a pending request for this exact resource
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
    
    // Create a promise for this request
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          ...options,
          credentials: 'include', // Always include cookies for consistent auth
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          }
        });
        
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache GET requests only, unless explicitly disabled
        const isGetRequest = !options.method || options.method === 'GET';
        if (isGetRequest && !skipCache) {
          requestCache.set(cacheKey, data);
          
          // Clear cache after 1 minute for fresh data later
          setTimeout(() => {
            requestCache.delete(cacheKey);
          }, 60000);
        }
        
        return data;
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
      } finally {
        // Clean up pending request when done
        pendingRequests.delete(cacheKey);
      }
    })();
    
    // Track the pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }

  // API Methods - Using the backend
  static async checkBackendConnection(): Promise<boolean> {
    try {
      const data = await LabelStorageService.fetchWithCache(`${API_URL}/health`, {}, true); // Skip cache for health checks
      console.log('Backend connection status:', data);
      return true;
    } catch (error) {
      console.error('Error connecting to backend:', error);
      return false;
    }
  }
  
  static async getProjects(): Promise<SavedProject[]> {
    try {
      const projects = await LabelStorageService.fetchWithCache(`${API_URL}/projects`);
      return projects;
    } catch (error) {
      console.error('Error fetching projects from API:', error);
      return [];
    }
  }
  
  static async getProjectById(id: string): Promise<SavedProject | null> {
    try {
      const project = await LabelStorageService.fetchWithCache(`${API_URL}/projects/${id}`);
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id} from API:`, error);
      return null;
    }
  }
  
  static async createEmptyProject(name: string = "Nowa etykieta"): Promise<SavedProject | null> {
    try {
      const project = await LabelStorageService.fetchWithCache(
        `${API_URL}/projects/empty`, 
        {
          method: 'POST',
          body: JSON.stringify({
            name: name,
            icon: '📋',
            description: ''
          })
        },
        true // Skip cache for mutations
      );
      return project;
    } catch (error) {
      console.error('Error creating empty project:', error);
      return null;
    }
  }
  
  static async getLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const labels = await LabelStorageService.fetchWithCache(`${API_URL}/projects/${projectId}/labels`);
      return labels;
    } catch (error) {
      console.error(`Error fetching labels for project ${projectId}:`, error);
      return [];
    }
  }

  // New method that automatically sorts by updated date
  static async getSortedLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const labels = await LabelStorageService.fetchWithCache(`${API_URL}/projects/${projectId}/labels`);
      // Sort labels by updatedAt date descending (newest first)
      return labels.sort((a: Label, b: Label) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching sorted labels for project ${projectId}:`, error);
      return [];
    }
  }

  static async getLabelById(projectId: string, labelId: string): Promise<Label | null> {
    try {
      const label = await LabelStorageService.fetchWithCache(`${API_URL}/projects/${projectId}/labels/${labelId}`);
      return label;
    } catch (error) {
      console.error(`Error fetching label ${labelId} from project ${projectId}:`, error);
      return null;
    }
  }

  static async updateLabel(projectId: string, label: Label): Promise<Label | null> {
    try {
      const updatedLabel = await LabelStorageService.fetchWithCache(
        `${API_URL}/projects/${projectId}/labels/${label.id}`, 
        {
          method: 'PUT',
          body: JSON.stringify(label)
        },
        true // Skip cache for mutations
      );
      
      // Invalidate related cache entries after update
      requestCache.delete(`GET-${API_URL}/projects/${projectId}/labels`);
      requestCache.delete(`GET-${API_URL}/projects/${projectId}/labels/${label.id}`);
      
      return updatedLabel;
    } catch (error) {
      console.error(`Error updating label ${label.id}:`, error);
      return null;
    }
  }

  // Always bypasses cache to ensure fresh data
  static async getLabelByIdNoCache(projectId: string, labelId: string): Promise<Label | null> {
    try {
      const label = await LabelStorageService.fetchWithCache(
        `${API_URL}/projects/${projectId}/labels/${labelId}`, 
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        },
        true // Skip cache
      );
      return label;
    } catch (error) {
      console.error(`Error fetching label ${labelId} from project ${projectId} (no cache):`, error);
      return null;
    }
  }

  // Clear all cached data (use when logging out or when needed)
  static clearCache(): void {
    requestCache.clear();
    console.log('LabelStorageService cache cleared');
  }
}