import ProjectListItem from './ProjectListItem';
import { Project } from '@/lib/types/project.types';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

function ProjectList({ projects, onDelete }: ProjectListProps) {
  return (
    <div className="mt-10 flex flex-col gap-2">
      {projects.map((project) => (
        <ProjectListItem key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ProjectList; 