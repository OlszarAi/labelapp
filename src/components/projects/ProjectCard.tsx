import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarIcon, ClockIcon, TagIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Project } from '@/lib/types/project.types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // If not clicking the delete button, navigate to project
    if (!e.defaultPrevented) {
      router.push(`/projekty/${project.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      className="relative bg-white dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700/50 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all cursor-pointer"
    >
      <div className="aspect-[3/2] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative p-6">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white text-4xl shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
          <span className="material-symbols-rounded">{project.icon || 'folder'}</span>
        </div>
        {project.description && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-sm">
            <p className="text-white text-sm text-center leading-relaxed">{project.description}</p>
          </div>
        )}
      </div>
      <div className="px-6 py-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate max-w-[80%]">
            {project.name}
          </h3>
          <button
            onClick={e => { e.preventDefault(); onDelete(project.id, e); }}
            className="text-neutral-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 focus:outline-none"
            title="Usuń projekt"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(project.labels || []).slice(0, 3).map((label) => (
            <span key={label.id} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400 text-xs font-medium">
              {label.name}
            </span>
          ))}
          {project.labels && project.labels.length > 3 && (
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 dark:bg-purple-400/10 dark:text-purple-400 text-xs font-medium">
              +{project.labels.length - 3}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Utworzono: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pl-PL') : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            <span>Ostatnia zmiana: {project.updatedAt ? `${new Date(project.updatedAt).toLocaleDateString('pl-PL')}, ${new Date(project.updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            <span>{project.labels?.length || 0} etykiet</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 