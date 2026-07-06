const STORAGE_KEY = 'todoAppProjects';

/**
 * Save projects array to localStorage.
 * @param {Array} projects
 */
export function saveProjects(projects) {
  try {
    // Strip methods for JSON serialization
    const data = projects.map((p) => ({
      id: p.id,
      name: p.name,
      todos: p.todos.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        priority: t.priority,
        notes: t.notes,
        checklist: t.checklist,
        completed: t.completed,
        createdAt: t.createdAt,
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

/**
 * Load projects from localStorage.
 * @returns {Array|null} raw project data or null if not found
 */
export function loadProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load projects from localStorage:', e);
    return null;
  }
}

/**
 * Clear all stored data.
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
