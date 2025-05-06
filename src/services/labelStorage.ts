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

export class LabelStorageService {
  // API Methods - Using the backend
  static async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Backend responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend connection status:', data);
      return true;
    } catch (error) {
      console.error('Error connecting to backend:', error);
      return false;
    }
  }
  
  static async getProjects(): Promise<SavedProject[]> {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const projects: SavedProject[] = await response.json();
      return projects;
    } catch (error) {
      console.error('Error fetching projects from API:', error);
      return [];
    }
  }
  
  static async getProjectById(id: string): Promise<SavedProject | null> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch project: ${response.status}`);
      }
      
      const project: SavedProject = await response.json();
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id} from API:`, error);
      return null;
    }
  }
  
  static async createEmptyProject(name: string = "Nowa etykieta"): Promise<SavedProject | null> {
    try {
      const response = await fetch(`${API_URL}/projects/empty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          icon: '📋',
          description: ''
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create new project: ${response.status}`);
      }
      
      const project: SavedProject = await response.json();
      return project;
    } catch (error) {
      console.error('Error creating empty project:', error);
      return null;
    }
  }
  
  static async getLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/labels`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch labels for project: ${response.status}`);
      }
      
      const labels: Label[] = await response.json();
      return labels;
    } catch (error) {
      console.error(`Error fetching labels for project ${projectId}:`, error);
      return [];
    }
  }

  static async getLabelById(projectId: string, labelId: string): Promise<Label | null> {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/labels/${labelId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch label: ${response.status}`);
      }
      
      const label: Label = await response.json();
      return label;
    } catch (error) {
      console.error(`Error fetching label ${labelId} from project ${projectId}:`, error);
      return null;
    }
  }

  static async updateLabel(projectId: string, label: Label): Promise<Label | null> {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/labels/${label.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(label),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update label: ${response.status}`);
      }
      
      const updatedLabel: Label = await response.json();
      return updatedLabel;
    } catch (error) {
      console.error(`Error updating label ${label.id}:`, error);
      return null;
    }
  }

  // Nowa metoda, która zawsze omija cache przeglądarki
  static async getLabelByIdNoCache(projectId: string, labelId: string): Promise<Label | null> {
    try {
      console.log(`[DEBUG] Requesting label - projectID: ${projectId}, labelID: ${labelId}`);
      
      // Dodajemy timestamp jako parametr zapytania, aby uniknąć cache'owania przez przeglądarkę
      const timestamp = new Date().getTime();
      const url = `${API_URL}/projects/${projectId}/labels/${labelId}?_=${timestamp}`;
      console.log(`[DEBUG] Request URL: ${url}`);
      
      const response = await fetch(url, {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      console.log(`[DEBUG] Response status: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch label: ${response.status}`);
      }
      
      const label: Label = await response.json();
      console.log(`[DEBUG] Received label - ID: ${label.id}, Name: ${label.name}`);
      return label;
    } catch (error) {
      console.error(`Error fetching label ${labelId} from project ${projectId}:`, error);
      return null;
    }
  }

  // Nowa metoda, która pobiera etykiety projektu z sortowaniem i bez cache'a
  static async getSortedLabelsForProject(projectId: string): Promise<Label[]> {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/projects/${projectId}/labels?_=${timestamp}`, {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch labels for project: ${response.status}`);
      }
      
      const labels: Label[] = await response.json();
      
      // Sortowanie po dacie utworzenia (od najstarszej do najnowszej)
      return labels.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    } catch (error) {
      console.error(`Error fetching sorted labels for project ${projectId}:`, error);
      return [];
    }
  }
}