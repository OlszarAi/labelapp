import React from 'react';

interface ProjectsToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  onNewProject: () => void;
}

export default function ProjectsToolbar({ search, setSearch, filter, setFilter, sort, setSort, onNewProject }: ProjectsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/80 dark:bg-neutral-900/80 rounded-xl p-4 shadow mb-8 border border-neutral-200/40 dark:border-neutral-700/50">
      <input
        type="text"
        placeholder="Wyszukaj projekty..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        className="flex-1 py-2 px-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <select
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
        className="py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Wszystkie</option>
        <option value="today">Utworzone dzisiaj</option>
        <option value="week">Ostatni tydzień</option>
      </select>
      <select
        value={sort}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
        className="py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="createdAt-desc">Najnowsze</option>
        <option value="createdAt-asc">Najstarsze</option>
        <option value="name-asc">Nazwa A-Z</option>
        <option value="name-desc">Nazwa Z-A</option>
      </select>
      <button
        onClick={onNewProject}
        className="py-2 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow transition-colors"
      >
        + Nowy projekt
      </button>
    </div>
  );
} 