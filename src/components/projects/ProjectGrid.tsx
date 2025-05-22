import ProjectCard from './ProjectCard';
import { Project } from '@/lib/types/project.types';

interface ProjectGridProps {
  projects: Project[];
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export default function ProjectGrid({ projects, onDelete }: ProjectGridProps) {
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
} 