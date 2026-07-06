import { createProject, rehydrateProject } from './project.js';
import { createTodo } from './todo.js';
import { saveProjects, loadProjects } from './storage.js';

const DEFAULT_PROJECT_NAME = 'Inbox';

class App {
  constructor() {
    this.projects = [];
    this.currentProjectId = null;
    this.currentTodoId = null;
    this.onChange = null; // callback to re-render UI
    this._init();
  }

  _init() {
    const saved = loadProjects();
    if (saved && saved.length > 0) {
      this.projects = saved.map(rehydrateProject);
    } else {
      const defaultProject = createProject(DEFAULT_PROJECT_NAME);
      this.projects.push(defaultProject);
    }
    this.currentProjectId = this.projects[0].id;
  }

  _save() {
    saveProjects(this.projects);
    if (this.onChange) this.onChange();
  }

  // --- Project operations ---

  get currentProject() {
    return this.projects.find((p) => p.id === this.currentProjectId);
  }

  get currentTodo() {
    if (!this.currentProject) return null;
    return this.currentProject.getTodo(this.currentTodoId);
  }

  addProject(name) {
    const project = createProject(name);
    this.projects.push(project);
    this.currentProjectId = project.id;
    this._save();
    return project;
  }

  removeProject(projectId) {
    // Don't allow deleting the last project
    if (this.projects.length <= 1) return false;
    this.projects = this.projects.filter((p) => p.id !== projectId);
    if (this.currentProjectId === projectId) {
      this.currentProjectId = this.projects[0].id;
    }
    this.currentTodoId = null;
    this._save();
    return true;
  }

  setCurrentProject(projectId) {
    this.currentProjectId = projectId;
    this.currentTodoId = null;
    this._save();
  }

  // --- Todo operations ---

  addTodo(title, description, dueDate, priority, notes, checklist) {
    if (!this.currentProject) return null;
    const todo = createTodo(title, description, dueDate, priority, notes, checklist);
    this.currentProject.addTodo(todo);
    this.currentTodoId = todo.id;
    this._save();
    return todo;
  }

  removeTodo(todoId) {
    if (!this.currentProject) return;
    this.currentProject.removeTodo(todoId);
    if (this.currentTodoId === todoId) {
      this.currentTodoId = null;
    }
    this._save();
  }

  toggleTodoComplete(todoId) {
    const todo = this.currentProject?.getTodo(todoId);
    if (todo) {
      todo.toggleComplete();
      this._save();
    }
  }

  // --- Checklist operations ---

  addChecklistItem(todoId, text) {
    const todo = this.currentProject?.getTodo(todoId);
    if (todo) {
      todo.addChecklistItem(text);
      this._save();
    }
  }

  toggleChecklistItem(todoId, index) {
    const todo = this.currentProject?.getTodo(todoId);
    if (todo) {
      todo.toggleChecklistItem(index);
      this._save();
    }
  }

  removeChecklistItem(todoId, index) {
    const todo = this.currentProject?.getTodo(todoId);
    if (todo) {
      todo.removeChecklistItem(index);
      this._save();
    }
  }

  updateTodo(todoId, updates) {
    const todo = this.currentProject?.getTodo(todoId);
    if (todo) {
      todo.update(updates);
      this._save();
    }
  }

  setCurrentTodo(todoId) {
    this.currentTodoId = todoId;
    this._save();
  }
}

// Singleton
let instance = null;

export function getApp() {
  if (!instance) {
    instance = new App();
  }
  return instance;
}
