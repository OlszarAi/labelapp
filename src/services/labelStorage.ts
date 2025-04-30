/**
 * Label Storage Service
 * 
 * Handles saving and loading label projects to/from localStorage.
 * This is a temporary solution until a proper backend is implemented.
 */

import { Label, LabelCollection } from '@/lib/types/label.types';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for stored label projects
export interface SavedProject {
  id: string;
  name: string;
  label: Label;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: LabelElement[];
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
  // For compatibility with existing code, we'll keep the localStorage methods
  // and add new API methods to work with the backend
  
  // Local Storage Methods
  static saveProjectToLocalStorage(name: string, label: Label): SavedProject {
    try {
      // Check if we have a projects array already
      const savedProjectsStr = localStorage.getItem('labelProjects');
      const savedProjects: SavedProject[] = savedProjectsStr ? JSON.parse(savedProjectsStr) : [];
      
      const now = new Date().toISOString();
      const existingIndex = savedProjects.findIndex(p => p.id === label.id);
      
      let updatedProject: SavedProject;
      
      if (existingIndex >= 0) {
        // Update existing project
        updatedProject = {
          ...savedProjects[existingIndex],
          name,
          label,
          updatedAt: now
        };
        savedProjects[existingIndex] = updatedProject;
      } else {
        // Create new project
        updatedProject = {
          id: label.id,
          name,
          label,
          createdAt: now,
          updatedAt: now
        };
        savedProjects.push(updatedProject);
      }
      
      // Save back to localStorage
      localStorage.setItem('labelProjects', JSON.stringify(savedProjects));
      return updatedProject;
    } catch (error) {
      console.error('Error saving project to localStorage:', error);
      throw new Error('Failed to save project');
    }
  }
  
  static getProjectFromLocalStorage(id: string): SavedProject | null {
    try {
      const savedProjectsStr = localStorage.getItem('labelProjects');
      if (!savedProjectsStr) return null;
      
      const savedProjects: SavedProject[] = JSON.parse(savedProjectsStr);
      return savedProjects.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting project from localStorage:', error);
      return null;
    }
  }
  
  static getRecentProjectsFromLocalStorage(limit: number = 10): SavedProject[] {
    try {
      const savedProjectsStr = localStorage.getItem('labelProjects');
      if (!savedProjectsStr) return [];
      
      const savedProjects: SavedProject[] = JSON.parse(savedProjectsStr);
      return savedProjects
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent projects from localStorage:', error);
      return [];
    }
  }

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
      const response = await fetch(`${API_URL}/projects`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const projects: SavedProject[] = await response.json();
      return projects;
    } catch (error) {
      console.error('Error fetching projects from API:', error);
      // Fall back to local storage
      return this.getRecentProjectsFromLocalStorage();
    }
  }
  
  static async getProjectById(id: string): Promise<SavedProject | null> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`);
      
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
      // Fall back to local storage
      return this.getProjectFromLocalStorage(id);
    }
  }
  
  static async saveProject(name: string, label: Label): Promise<SavedProject> {
    try {
      // Check if we're updating an existing project or creating a new one
      let response;
      
      if (label.id) {
        // Try to get the project from the API
        const existingProject = await this.getProjectById(label.id);
        
        if (existingProject) {
          // Update existing project
          response = await fetch(`${API_URL}/projects/${label.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, label }),
          });
        } else {
          // Create new project with existing label ID
          response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, label }),
          });
        }
      } else {
        // Create new project
        response = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, label }),
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to save project: ${response.status}`);
      }
      
      const savedProject: SavedProject = await response.json();
      
      // Also save to local storage as backup
      this.saveProjectToLocalStorage(name, label);
      
      return savedProject;
    } catch (error) {
      console.error('Error saving project to API:', error);
      // Fall back to local storage only
      return this.saveProjectToLocalStorage(name, label);
    }
  }
  
  // Combined methods for seamless experience
  static getRecentProjects(limit: number = 10): SavedProject[] {
    // For now, only use localStorage
    // In a full implementation, you'd merge results from API and localStorage
    return this.getRecentProjectsFromLocalStorage(limit);
  }
  
  static getProjectById(id: string): SavedProject | null {
    // For now, only use localStorage
    // In a full implementation, you'd try API first, then fall back to localStorage
    return this.getProjectFromLocalStorage(id);
  }
  
  static saveProject(name: string, label: Label): SavedProject {
    // For now, only use localStorage
    // In a full implementation, you'd try API first, then fall back to localStorage
    return this.saveProjectToLocalStorage(name, label);
  }
}