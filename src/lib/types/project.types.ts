/**
 * Legacy project types for backward compatibility
 */
import { Label } from '@/services/labelStorage';

export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  icon?: string;
  description?: string;
  labels?: Label[];
}

export interface ProjectFormData {
  name: string;
  icon?: string;
  description?: string;
}
