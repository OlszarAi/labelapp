"use client";

import { useState, useEffect } from 'react';
import ProjectsToolbar from '@/components/projects/ProjectsToolbar';
import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectList from '@/components/projects/ProjectList';
import ProjectFormModal from '@/components/projects/ProjectFormModal';
import { LabelStorageService, SavedProject } from '@/services/labelStorage';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/solid';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('createdAt-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const projectsData = await LabelStorageService.getProjects();
      setProjects(projectsData);
      setError(null);
    } catch {
      setError('Nie udało się pobrać projektów.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // Filtrowanie i wyszukiwanie
  let filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === 'today') {
    const today = new Date().toISOString().slice(0, 10);
    filtered = filtered.filter(p => p.createdAt && p.createdAt.slice(0, 10) === today);
  } else if (filter === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(p => p.createdAt && new Date(p.createdAt) >= weekAgo);
  }
  if (sort === 'createdAt-desc') filtered = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (sort === 'createdAt-asc') filtered = filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (sort === 'name-asc') filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));

  // Usuwanie projektu
  const handleDeleteProject = async (projectId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (confirm('Czy na pewno chcesz usunąć ten projekt?')) {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE', credentials: 'include' });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  // Tworzenie projektu
  const handleCreateProject = async (projectData: Record<string, unknown>) => {
    await fetch(`/api/projects/empty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
      credentials: 'include',
    });
    setIsProjectModalOpen(false);
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Moje projekty</h1>
        <ProjectsToolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          onNewProject={() => setIsProjectModalOpen(true)}
        />
        <div className="flex justify-end mb-2">
          <div className="inline-flex rounded-lg bg-neutral-200 dark:bg-neutral-800 p-1">
            <button
              className={`px-3 py-1 flex items-center gap-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow' : 'text-neutral-500 hover:text-blue-500'}`}
              onClick={() => setViewMode('list')}
              title="Widok listy"
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              className={`px-3 py-1 flex items-center gap-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 text-blue-600 shadow' : 'text-neutral-500 hover:text-blue-500'}`}
              onClick={() => setViewMode('grid')}
              title="Widok kafelków"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10' : 'mt-10 flex flex-col gap-2'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={viewMode === 'grid' ? 'h-56 bg-neutral-800/60 rounded-xl animate-pulse' : 'h-16 bg-neutral-800/60 rounded-xl animate-pulse'} />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : (
          viewMode === 'grid'
            ? <ProjectGrid projects={filtered} onDelete={handleDeleteProject} />
            : <ProjectList projects={filtered} onDelete={handleDeleteProject} />
        )}
        {isProjectModalOpen && (
          <ProjectFormModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onSubmit={handleCreateProject}
          />
        )}
      </div>
    </div>
  );
}