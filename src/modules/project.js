import { rehydrateTodo, generateId } from './todo.js';

/**
 * Creates a new Project object.
 * @param {string} name
 * @returns {object} project
 */
export function createProject(name) {
  return {
    id: generateId(),
    name,
    todos: [],

    addTodo(todo) {
      this.todos.push(todo);
    },

    removeTodo(todoId) {
      this.todos = this.todos.filter((t) => t.id !== todoId);
    },

    getTodo(todoId) {
      return this.todos.find((t) => t.id === todoId);
    },

    get todosByPriority() {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...this.todos].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    },

    get completedTodos() {
      return this.todos.filter((t) => t.completed);
    },

    get activeTodos() {
      return this.todos.filter((t) => !t.completed);
    },

    get todoCount() {
      return this.todos.length;
    },

    get completedCount() {
      return this.completedTodos.length;
    },

    rename(newName) {
      this.name = newName;
    },
  };
}

/**
 * Rehydrate a plain JSON project back to a full project with methods.
 * @param {object} data - raw JSON project data from localStorage
 * @returns {object} project with methods and rehydrated todos
 */
export function rehydrateProject(data) {
  const project = createProject(data.name);
  project.id = data.id;
  project.todos = (data.todos || []).map(rehydrateTodo);
  return project;
}
