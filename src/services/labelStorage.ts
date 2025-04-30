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
  description?: string;
  label: Label;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface SavedProjectsList {
  projects: SavedProject[];
  lastUpdated: string;
}

// Constants
const STORAGE_KEY_PROJECTS = 'labelapp_saved_projects';
const STORAGE_KEY_RECENT = 'labelapp_recent_projects';

/**
 * Service for managing label storage
 */
export class LabelStorageService {
  /**
   * Save a label project to local storage
   * 
   * @param name Project name
   * @param label The label to save
   * @param description Optional project description
   * @param tags Optional tags for the project
   * @returns The saved project with generated ID
   */
  static saveProject(
    name: string, 
    label: Label, 
    description: string = '', 
    tags: string[] = []
  ): SavedProject {
    // Get existing projects
    const existingProjects = this.getProjects();
    
    // Check if this is an update to an existing project
    const existingProject = existingProjects.projects.find(p => p.id === label.id);
    
    const now = new Date().toISOString();
    let updatedProject: SavedProject;
    
    if (existingProject) {
      // Update existing project
      updatedProject = {
        ...existingProject,
        name,
        description,
        label,
        updatedAt: now,
        tags
      };
      
      // Replace the existing project
      const updatedProjects = {
        projects: existingProjects.projects.map(p => 
          p.id === label.id ? updatedProject : p
        ),
        lastUpdated: now
      };
      
      // Save to local storage
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
    } else {
      // Create a new project
      const newProject: SavedProject = {
        id: uuidv4(),
        name,
        description,
        label: {
          ...label,
          id: label.id || uuidv4() // Ensure label has an ID
        },
        createdAt: now,
        updatedAt: now,
        tags
      };
      
      // Add to existing projects
      const updatedProjects = {
        projects: [...existingProjects.projects, newProject],
        lastUpdated: now
      };
      
      // Save to local storage
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
      
      updatedProject = newProject;
    }
    
    // Update recent projects
    this.updateRecentProjects(updatedProject.id);
    
    return updatedProject;
  }
  
  /**
   * Get all saved projects
   * 
   * @returns List of all saved projects
   */
  static getProjects(): SavedProjectsList {
    try {
      const projectsJson = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (!projectsJson) {
        return { projects: [], lastUpdated: new Date().toISOString() };
      }
      
      return JSON.parse(projectsJson);
    } catch (error) {
      console.error('Error retrieving saved projects:', error);
      return { projects: [], lastUpdated: new Date().toISOString() };
    }
  }
  
  /**
   * Get a specific project by ID
   * 
   * @param id Project ID
   * @returns The project or null if not found
   */
  static getProjectById(id: string): SavedProject | null {
    const projects = this.getProjects();
    const project = projects.projects.find(p => p.id === id);
    
    if (project) {
      // Update recent projects
      this.updateRecentProjects(id);
      return project;
    }
    
    return null;
  }
  
  /**
   * Delete a project
   * 
   * @param id Project ID to delete
   * @returns true if deletion was successful
   */
  static deleteProject(id: string): boolean {
    const existingProjects = this.getProjects();
    const projectIndex = existingProjects.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return false;
    }
    
    // Remove the project
    existingProjects.projects.splice(projectIndex, 1);
    existingProjects.lastUpdated = new Date().toISOString();
    
    // Save updated list
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(existingProjects));
    
    // Remove from recent projects
    this.removeFromRecentProjects(id);
    
    return true;
  }
  
  /**
   * Get recently accessed projects
   * 
   * @param limit Maximum number of projects to return
   * @returns Array of recent projects
   */
  static getRecentProjects(limit: number = 5): SavedProject[] {
    try {
      const recentJson = localStorage.getItem(STORAGE_KEY_RECENT);
      if (!recentJson) {
        return [];
      }
      
      const recentIds: string[] = JSON.parse(recentJson);
      const allProjects = this.getProjects();
      
      // Filter and sort projects by recent access
      const recentProjects = recentIds
        .map(id => allProjects.projects.find(p => p.id === id))
        .filter(p => p !== undefined) as SavedProject[];
      
      return recentProjects.slice(0, limit);
    } catch (error) {
      console.error('Error retrieving recent projects:', error);
      return [];
    }
  }
  
  /**
   * Update the list of recently accessed projects
   * 
   * @param id Project ID to add to recent list
   */
  private static updateRecentProjects(id: string): void {
    try {
      const recentJson = localStorage.getItem(STORAGE_KEY_RECENT);
      let recentIds: string[] = recentJson ? JSON.parse(recentJson) : [];
      
      // Remove the ID if it already exists
      recentIds = recentIds.filter(existingId => existingId !== id);
      
      // Add the ID at the beginning (most recent)
      recentIds.unshift(id);
      
      // Limit to 10 recent projects
      if (recentIds.length > 10) {
        recentIds = recentIds.slice(0, 10);
      }
      
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentIds));
    } catch (error) {
      console.error('Error updating recent projects:', error);
    }
  }
  
  /**
   * Remove a project from the recent projects list
   * 
   * @param id Project ID to remove
   */
  private static removeFromRecentProjects(id: string): void {
    try {
      const recentJson = localStorage.getItem(STORAGE_KEY_RECENT);
      if (!recentJson) return;
      
      let recentIds: string[] = JSON.parse(recentJson);
      
      // Remove the ID
      recentIds = recentIds.filter(existingId => existingId !== id);
      
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentIds));
    } catch (error) {
      console.error('Error removing project from recent list:', error);
    }
  }
  
  /**
   * Create a default empty label template
   * 
   * @param name Label name
   * @returns A new empty label
   */
  static createEmptyLabel(name: string = 'Nowa etykieta'): Label {
    const now = new Date();
    
    return {
      id: uuidv4(),
      name,
      width: 90,
      height: 50,
      elements: [],
      createdAt: now,
      updatedAt: now
    };
  }
}