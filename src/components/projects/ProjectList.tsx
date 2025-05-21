import ProjectListItem from './ProjectListItem';

function ProjectList({ projects, onDelete }) {
  return (
    <div className="mt-10 flex flex-col gap-2">
      {projects.map(project => (
        <ProjectListItem key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ProjectList; 