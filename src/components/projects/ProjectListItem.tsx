import { CalendarIcon, ClockIcon, TagIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

function stringToHslColor(str: string, s = 60, l = 60) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = hash % 360;
  return `hsl(${h},${s}%,${l}%)`;
}

export default function ProjectListItem({ project, onDelete }) {
  const router = useRouter();
  const color = stringToHslColor(project.name);

  const handleClick = (e) => {
    // If not clicking the delete button, navigate to project
    if (!e.defaultPrevented) {
      router.push(`/projekty/${project.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex items-center bg-white dark:bg-neutral-800 rounded-xl shadow border border-neutral-200/40 dark:border-neutral-700/50 mb-3 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="w-2 h-16 rounded-l-xl" style={{ background: color }} />
      <div className="flex items-center px-4 py-3 flex-1 gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700/50 group-hover:scale-105 transition-transform">
          <FolderIcon className="w-8 h-8" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">{project.name}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300 truncate">{project.description || <span className="italic text-xs">Brak opisu</span>}</div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-[180px]">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4" />
            <span>Utworzono: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pl-PL') : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4" />
            <span>Zmieniono: {project.updatedAt ? `${new Date(project.updatedAt).toLocaleDateString('pl-PL')}, ${new Date(project.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TagIcon className="w-4 h-4" />
            <span>{project.labels?.length || 0} etykiet</span>
          </div>
        </div>
        <button 
          onClick={e => { e.preventDefault(); onDelete(project.id, e); }} 
          className="ml-4 text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 focus:outline-none" 
          title="Usuń projekt"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 