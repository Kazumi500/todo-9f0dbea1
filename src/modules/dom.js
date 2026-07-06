import { getApp } from './app.js';
import { format, parseISO, isValid } from 'date-fns';

// ─── State ────────────────────────────────────────────────────────
const app = getApp();
let confirmCallback = null; // for custom confirm modal

// ─── DOM References ────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);

// Sidebar
const projectList = $('#project-list');
const addProjectBtn = $('#add-project-btn');
const addTodoBtn = $('#add-todo-btn');

// Header
const projectTitle = $('#project-title');
const projectStats = $('#project-stats');
const deleteProjectBtn = $('#delete-project-btn');

// Todo list
const todoList = $('#todo-list');

// Stats
const activeCount = $('#active-count');
const completedCount = $('#completed-count');
const quickCompleted = $('#quick-completed');
const quickPending = $('#quick-pending');
const greetingSubtitle = $('#greeting-subtitle');

// Mobile
const mobileSidebarOverlay = $('#mobile-sidebar-overlay');
const mobileMenuBtn = $('#mobile-menu-btn');
const mobileAddTodoBtn = $('#mobile-add-todo-btn');
const mobileAddBtn = $('#mobile-add-btn');
const mobileProjectsBtn = $('#mobile-projects-btn');

// Todo Modal
const todoModal = $('#todo-modal');
const todoForm = $('#todo-form');
const todoModalTitle = $('#todo-modal-title');
const todoIdInput = $('#todo-id');
const todoTitleInput = $('#todo-title');
const todoDescInput = $('#todo-description');
const todoDueDateInput = $('#todo-dueDate');
const todoPrioritySelect = $('#todo-priority');
const todoNotesInput = $('#todo-notes');
const closeTodoModal = $('#close-todo-modal');
const cancelTodoBtn = $('#cancel-todo-btn');

// Checklist Modal
const checklistModal = $('#checklist-modal');
const checklistItems = $('#checklist-items');
const checklistInput = $('#checklist-input');
const addChecklistItemBtn = $('#add-checklist-item-btn');
const closeChecklistModal = $('#close-checklist-modal');

// Project Modal
const projectModal = $('#project-modal');
const projectForm = $('#project-form');
const projectNameInput = $('#project-name');
const cancelProjectBtn = $('#cancel-project-btn');

// Confirm Modal
const confirmModal = $('#confirm-modal');
const confirmTitle = $('#confirm-title');
const confirmMessage = $('#confirm-message');
const confirmOkBtn = $('#confirm-ok-btn');
const confirmCancelBtn = $('#confirm-cancel-btn');

// Search
const searchInput = $('#search-input');

// ─── Mobile Sidebar ───────────────────────────────────────────────
const sidebar = document.querySelector('aside');

function toggleMobileSidebar(show) {
  if (!sidebar) return;
  // Only toggle mobile sidebar behavior on small screens
  if (window.innerWidth >= 768) return;
  if (show === undefined) {
    show = sidebar.classList.contains('hidden');
  }
  if (show) {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('fixed', 'inset-0', 'z-50', 'w-full', 'max-w-xs');
    mobileSidebarOverlay?.classList.remove('hidden');
  } else {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('fixed', 'inset-0', 'z-50', 'w-full', 'max-w-xs');
    mobileSidebarOverlay?.classList.add('hidden');
  }
}

mobileMenuBtn?.addEventListener('click', () => toggleMobileSidebar(true));
mobileSidebarOverlay?.addEventListener('click', () => toggleMobileSidebar(false));
mobileAddTodoBtn?.addEventListener('click', openNewTodoModal);
mobileAddBtn?.addEventListener('click', () => {
  toggleMobileSidebar(false);
  todoList.scrollIntoView({ behavior: 'smooth' });
});
mobileProjectsBtn?.addEventListener('click', () => toggleMobileSidebar(true));

// ─── Custom Confirm ───────────────────────────────────────────────
function openConfirm(title, message, callback, buttonLabel) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmOkBtn.textContent = buttonLabel || 'Delete';
  confirmModal.classList.remove('hidden');
}

function closeConfirm() {
  confirmModal.classList.add('hidden');
  confirmCallback = null;
}

confirmOkBtn.addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeConfirm();
});
confirmCancelBtn.addEventListener('click', closeConfirm);
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) closeConfirm();
});

// ─── Render ────────────────────────────────────────────────────────
function render() {
  renderSidebar();
  renderHeader();
  renderStats();
  renderTodos();
}

function renderSidebar() {
  projectList.innerHTML = '';
  // Render "Inbox" as a special project item with an icon
  const inboxIcon = `<span class="material-symbols-outlined text-[18px]">inbox</span>`;

  app.projects.forEach((project) => {
    const li = document.createElement('li');
    const active = project.id === app.currentProjectId;
    li.className = `project-nav-item flex items-center gap-md px-md py-2 rounded-lg cursor-pointer transition-all duration-200 ${
      active
        ? 'active bg-secondary-container text-on-secondary-container font-medium'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    }`;
    li.dataset.projectId = project.id;

    // Icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-symbols-outlined text-[18px]';
    // Use inbox icon for first/default project, folder for others
    iconSpan.textContent = project === app.projects[0] ? 'inbox' : 'folder';

    // Name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'flex-1 truncate font-label-md text-label-md';
    nameSpan.textContent = project.name;

    // Count
    const count = project.activeTodos.length;
    const countBadge = document.createElement('span');
    if (count > 0) {
      countBadge.className = `font-label-sm text-label-sm px-1.5 py-0.5 rounded-full ${
        active ? 'bg-on-secondary-container/10' : 'bg-surface-variant text-on-surface-variant'
      }`;
      countBadge.textContent = count;
    }

    li.appendChild(iconSpan);
    li.appendChild(nameSpan);
    if (count > 0) li.appendChild(countBadge);

    li.addEventListener('click', () => {
      app.setCurrentProject(project.id);
      render();
      // Close mobile sidebar on selection
      toggleMobileSidebar(false);
    });

    projectList.appendChild(li);
  });
}

function renderHeader() {
  const proj = app.currentProject;
  if (!proj) return;
  projectTitle.textContent = proj.name;
  const total = proj.todoCount;
  const done = proj.completedCount;
  projectStats.textContent = `${total} task${total !== 1 ? 's' : ''}${done > 0 ? ` · ${done} done` : ''}`;
}

function renderStats() {
  const proj = app.currentProject;
  if (!proj) return;
  const total = proj.todoCount;
  const done = proj.completedCount;
  const pending = total - done;

  activeCount.textContent = pending;
  completedCount.textContent = done;
  quickCompleted.textContent = done;
  quickPending.textContent = pending;

  if (total === 0) {
    greetingSubtitle.textContent = 'No tasks yet. Create your first task to get started!';
  } else if (done === total) {
    greetingSubtitle.textContent = 'All tasks completed! Great work! 🎉';
  } else {
    greetingSubtitle.textContent = `You have ${pending} task${pending !== 1 ? 's' : ''} to complete. Stay productive!`;
  }
}

function renderTodos() {
  todoList.innerHTML = '';
  const proj = app.currentProject;
  if (!proj || proj.todos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined text-[48px] mb-3" style="font-variation-settings: 'FILL' 1;">task_alt</span>
        <p class="font-body-md text-body-md">No tasks yet.</p>
        <p class="font-body-sm text-body-sm mt-1">Click "New Task" to get started.</p>
      </div>
    `;
    return;
  }

  const sorted = proj.todosByPriority;
  sorted.forEach((todo) => {
    const card = document.createElement('div');
    const isExpanded = todo.id === app.currentTodoId;
    card.className = `task-item bg-surface-container-lowest border border-outline-variant/50 p-md rounded-lg transition-all ${
      isExpanded ? 'border-primary/40 shadow-md' : 'hover:border-outline-variant'
    }`;
    if (!isExpanded) {
      card.classList.add('task-item-new');
    }
    if (todo.completed) {
      card.classList.add('task-completed');
    }

    // ── Compact Row ──
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';

    // Checkbox (styled like design)
    const checkBox = document.createElement('div');
    checkBox.className = `w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
      todo.completed
        ? 'bg-primary border-primary'
        : 'border-outline-variant hover:border-primary'
    }`;
    if (todo.completed) {
      checkBox.innerHTML = '<span class="material-symbols-outlined text-[14px] text-white" style="font-variation-settings: \'FILL\' 1;">check</span>';
    }
    checkBox.addEventListener('click', (e) => {
      e.stopPropagation();
      app.toggleTodoComplete(todo.id);
      render();
    });

    // Priority dot
    const dot = document.createElement('span');
    dot.className = `priority-dot ${todo.priority}`;

    // Title
    const title = document.createElement('span');
    title.className = `task-title flex-1 font-body-md text-body-md truncate ${
      todo.completed ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'
    }`;
    title.textContent = todo.title;

    // Tags row (priority + date)
    const tags = document.createElement('div');
    tags.className = 'flex items-center gap-2 flex-shrink-0';

    // Priority tag
    const priorityTag = document.createElement('span');
    priorityTag.className = `font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
      todo.priority === 'high' ? 'bg-error-container text-error' :
      todo.priority === 'medium' ? 'bg-secondary-container text-on-secondary-container' :
      'bg-surface-variant text-on-surface-variant'
    }`;
    priorityTag.textContent = todo.priorityLabel;

    // Date
    if (todo.dueDate) {
      const dateSpan = document.createElement('span');
      dateSpan.className = `font-label-sm text-label-sm flex items-center gap-1 ${
        todo.isOverdue ? 'text-error' : 'text-on-surface-variant opacity-60'
      }`;
      dateSpan.innerHTML = `<span class="material-symbols-outlined text-[14px]">schedule</span>${todo.formattedDueDate}`;
      tags.appendChild(dateSpan);
    }

    // Expand/collapse arrow
    const expandIcon = document.createElement('span');
    expandIcon.className = `material-symbols-outlined text-on-surface-variant opacity-40 transition-transform duration-200 ${
      isExpanded ? 'rotate-180' : ''
    }`;
    expandIcon.textContent = 'expand_more';

    row.appendChild(checkBox);
    row.appendChild(dot);
    row.appendChild(title);
    row.appendChild(tags);
    row.appendChild(expandIcon);
    card.appendChild(row);

    // ── Expanded Details ──
    if (isExpanded) {
      const expanded = document.createElement('div');
      expanded.className = 'mt-3 pt-3 border-t border-outline-variant/30 space-y-3';

      // Description
      if (todo.description) {
        const desc = document.createElement('p');
        desc.className = 'font-body-sm text-body-sm text-on-surface-variant';
        desc.textContent = todo.description;
        expanded.appendChild(desc);
      }

      // Notes
      if (todo.notes) {
        const notes = document.createElement('div');
        notes.className = 'bg-surface-container-low rounded-lg p-3';
        const notesLabel = document.createElement('p');
        notesLabel.className = 'font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1';
        notesLabel.textContent = 'Notes';
        notes.appendChild(notesLabel);
        const notesContent = document.createElement('p');
        notesContent.className = 'font-body-sm text-body-sm text-on-surface';
        notesContent.textContent = todo.notes;
        notes.appendChild(notesContent);
        expanded.appendChild(notes);
      }

      // Checklist inline
      if (todo.checklist && todo.checklist.length > 0) {
        const cl = document.createElement('div');
        cl.className = 'space-y-1';
        const clLabel = document.createElement('p');
        clLabel.className = 'font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider';
        const doneCount = todo.checklist.filter(i => i.done).length;
        clLabel.textContent = `Checklist (${doneCount}/${todo.checklist.length})`;
        cl.appendChild(clLabel);
        todo.checklist.forEach((item, idx) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'flex items-center gap-2 py-0.5';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = item.done;
          cb.className = 'h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer';
          cb.addEventListener('change', () => {
            app.toggleChecklistItem(todo.id, idx);
            render();
          });
          const label = document.createElement('span');
          label.className = `font-body-sm text-body-sm ${item.done ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'}`;
          label.textContent = item.text;
          itemDiv.appendChild(cb);
          itemDiv.appendChild(label);
          cl.appendChild(itemDiv);
        });
        expanded.appendChild(cl);
      }

      // Action buttons row
      const actions = document.createElement('div');
      actions.className = 'flex gap-2 pt-2';

      const editBtn = document.createElement('button');
      editBtn.className = 'flex items-center gap-1 px-3 py-1.5 font-label-sm text-label-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer';
      editBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">edit</span> Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditTodoModal(todo);
      });

      const checklistBtn = document.createElement('button');
      checklistBtn.className = 'flex items-center gap-1 px-3 py-1.5 font-label-sm text-label-sm text-tertiary bg-tertiary/5 hover:bg-tertiary/10 rounded-lg transition-colors cursor-pointer';
      checklistBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">checklist</span> Checklist';
      checklistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        app.currentTodoId = todo.id;
        openChecklistModal(todo);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'flex items-center gap-1 px-3 py-1.5 font-label-sm text-label-sm text-error bg-error/5 hover:bg-error/10 rounded-lg transition-colors cursor-pointer';
      deleteBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span> Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openConfirm('Delete Task', `Are you sure you want to delete "${todo.title}"?`, () => {
          app.removeTodo(todo.id);
          render();
        });
      });

      actions.appendChild(editBtn);
      actions.appendChild(checklistBtn);
      actions.appendChild(deleteBtn);
      expanded.appendChild(actions);

      card.appendChild(expanded);
    }

    // Click to expand/collapse
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (e.target.closest('.priority-dot')) return;
      if (e.target.tagName === 'INPUT') return;
      if (e.target.closest('.w-5.h-5')) return;
      app.setCurrentTodo(isExpanded ? null : todo.id);
      render();
    });

    todoList.appendChild(card);
  });
}

// ─── Search ────────────────────────────────────────────────────────
let searchTimeout = null;
searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchInput.value.trim().toLowerCase();
    const cards = todoList.querySelectorAll('.task-item');
    cards.forEach((card) => {
      const title = card.querySelector('.task-title')?.textContent?.toLowerCase() || '';
      card.style.display = title.includes(query) ? '' : 'none';
    });
  }, 200);
});

// ─── Project Modal ────────────────────────────────────────────────
function openProjectModal() {
  projectModal.classList.remove('hidden');
  projectNameInput.value = '';
  projectNameInput.focus();
}

function closeProjectModalFn() {
  projectModal.classList.add('hidden');
}

addProjectBtn?.addEventListener('click', openProjectModal);
cancelProjectBtn?.addEventListener('click', closeProjectModalFn);
projectModal?.addEventListener('click', (e) => {
  if (e.target === projectModal) closeProjectModalFn();
});

projectForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = projectNameInput.value.trim();
  if (!name) return;
  app.addProject(name);
  closeProjectModalFn();
  render();
});

// ─── Delete Project ────────────────────────────────────────────────
deleteProjectBtn?.addEventListener('click', () => {
  const proj = app.currentProject;
  if (!proj) return;
  if (app.projects.length <= 1) {
    openConfirm('Cannot Delete', 'You must have at least one project.', () => {}, 'OK');
    return;
  }
  openConfirm('Delete Project', `Delete "${proj.name}" and all its tasks? This cannot be undone.`, () => {
    app.removeProject(proj.id);
    render();
  });
});

// ─── Todo Modal ────────────────────────────────────────────────────
function openNewTodoModal() {
  todoModalTitle.textContent = 'New Task';
  todoForm.reset();
  todoIdInput.value = '';
  todoPrioritySelect.value = 'medium';
  todoDueDateInput.value = format(new Date(), 'yyyy-MM-dd');
  todoModal.classList.remove('hidden');
  setTimeout(() => todoTitleInput.focus(), 100);
}

function openEditTodoModal(todo) {
  todoModalTitle.textContent = 'Edit Task';
  todoIdInput.value = todo.id;
  todoTitleInput.value = todo.title;
  todoDescInput.value = todo.description;
  todoDueDateInput.value = todo.dueDate;
  todoPrioritySelect.value = todo.priority;
  todoNotesInput.value = todo.notes;
  todoModal.classList.remove('hidden');
  setTimeout(() => todoTitleInput.focus(), 100);
}

function closeTodoModalFn() {
  todoModal.classList.add('hidden');
}

closeTodoModal?.addEventListener('click', closeTodoModalFn);
cancelTodoBtn?.addEventListener('click', closeTodoModalFn);
todoModal?.addEventListener('click', (e) => {
  if (e.target === todoModal) closeTodoModalFn();
});

todoForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = todoTitleInput.value.trim();
  if (!title) return;

  const id = todoIdInput.value;
  const dueDate = todoDueDateInput.value;
  const priority = todoPrioritySelect.value;

  if (id) {
    app.updateTodo(id, {
      title,
      description: todoDescInput.value.trim(),
      dueDate,
      priority,
      notes: todoNotesInput.value.trim(),
    });
  } else {
    app.addTodo(title, todoDescInput.value.trim(), dueDate, priority, todoNotesInput.value.trim());
  }

  closeTodoModalFn();
  render();
});

addTodoBtn?.addEventListener('click', openNewTodoModal);

// ─── Checklist Modal ───────────────────────────────────────────────
let checklistTodoId = null;

function openChecklistModal(todo) {
  checklistTodoId = todo.id;
  checklistModal.classList.remove('hidden');
  renderChecklistItems(todo);
  checklistInput.value = '';
  setTimeout(() => checklistInput.focus(), 100);
}

function closeChecklistModalFn() {
  checklistModal.classList.add('hidden');
  checklistTodoId = null;
}

function renderChecklistItems(todo) {
  checklistItems.innerHTML = '';
  if (!todo.checklist || todo.checklist.length === 0) {
    checklistItems.innerHTML = '<p class="font-body-sm text-body-sm text-on-surface-variant text-center py-4 opacity-60">No checklist items yet.</p>';
    return;
  }
  todo.checklist.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 py-1.5 px-2 rounded hover:bg-surface-container-low group';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done;
    cb.className = 'h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer';
    cb.addEventListener('change', () => {
      app.toggleChecklistItem(todo.id, idx);
      renderChecklistItems(todo);
      render();
    });

    const label = document.createElement('span');
    label.className = `flex-1 font-body-sm text-body-sm ${item.done ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'}`;
    label.textContent = item.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-1 cursor-pointer';
    delBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">close</span>';
    delBtn.addEventListener('click', () => {
      app.removeChecklistItem(todo.id, idx);
      renderChecklistItems(todo);
      render();
    });

    div.appendChild(cb);
    div.appendChild(label);
    div.appendChild(delBtn);
    checklistItems.appendChild(div);
  });
}

closeChecklistModal?.addEventListener('click', closeChecklistModalFn);
checklistModal?.addEventListener('click', (e) => {
  if (e.target === checklistModal) closeChecklistModalFn();
});

addChecklistItemBtn?.addEventListener('click', () => {
  const text = checklistInput.value.trim();
  if (!text || !checklistTodoId) return;
  app.addChecklistItem(checklistTodoId, text);
  const todo = app.currentProject?.getTodo(checklistTodoId);
  if (todo) renderChecklistItems(todo);
  checklistInput.value = '';
  checklistInput.focus();
});

checklistInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addChecklistItemBtn.click();
  }
});

// ─── Keyboard Shortcuts ────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!confirmModal.classList.contains('hidden')) closeConfirm();
    else if (!todoModal.classList.contains('hidden')) closeTodoModalFn();
    else if (!checklistModal.classList.contains('hidden')) closeChecklistModalFn();
    else if (!projectModal.classList.contains('hidden')) closeProjectModalFn();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openNewTodoModal();
  }
  // Ctrl+Shift+N for new project
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
    e.preventDefault();
    openProjectModal();
  }
});

// ─── Search bar animation ─────────────────────────────────────────
searchInput?.addEventListener('focus', () => {
  searchInput.parentElement.classList.add('ring-2', 'ring-primary');
});
searchInput?.addEventListener('blur', () => {
  searchInput.parentElement.classList.remove('ring-2', 'ring-primary');
});

// ─── Init ──────────────────────────────────────────────────────────
export function initUI() {
  app.onChange = render;
  render();
}
