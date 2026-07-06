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

// ─── Task Detail Modal DOM Refs ────────────────────────────────────
const taskDetailModal = $('#task-detail-modal');
const closeTaskDetail = $('#close-task-detail');
const detailTitle = $('#detail-title');
const detailPriorityBadge = $('#detail-priority-badge');
const detailDescription = $('#detail-description');
const detailChecklist = $('#detail-checklist');
const detailChecklistTitle = $('#detail-checklist-title');
const detailAddSubtaskBtn = $('#detail-add-subtask-btn');
const detailNotesSection = $('#detail-notes-section');
const detailNotes = $('#detail-notes');
const detailSidebarAssignee = $('#detail-sidebar-assignee');
const detailSidebarDuedate = $('#detail-sidebar-duedate');
const detailSidebarProject = $('#detail-sidebar-project');
const detailSidebarPriority = $('#detail-sidebar-priority');
const detailTags = $('#detail-tags');
const detailTimeSpent = $('#detail-time-spent');
const detailTimePercent = $('#detail-time-percent');
const detailTimeBar = $('#detail-time-bar');
const detailComments = $('#detail-comments');
const detailCommentInput = $('#detail-comment-input');
const detailSendCommentBtn = $('#detail-send-comment-btn');
const detailEditBtn = $('#detail-edit-btn');
const detailDeleteBtn = $('#detail-delete-btn');
const detailBreadcrumbProject = $('#detail-breadcrumb-project');
const detailBreadcrumbTitle = $('#detail-breadcrumb-title');
const detailAssigneeAvatar = $('#detail-assignee-avatar');
const detailAssigneeName = $('#detail-assignee-name');
const detailAttachmentsSection = $('#detail-attachments-section');
const detailAttachments = $('#detail-attachments');
const detailAddAttachmentBtn = $('#detail-add-attachment-btn');
const detailTimePlayBtn = $('#detail-time-play-btn');

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
    card.className = 'task-item bg-surface-container-lowest border border-outline-variant/50 p-md rounded-lg transition-all hover:border-outline-variant cursor-pointer task-item-new';
    if (todo.completed) {
      card.classList.add('task-completed');
    }

    // ── Compact Row ──
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';

    // Checkbox
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

    // Open detail indicator (arrow)
    const openIcon = document.createElement('span');
    openIcon.className = 'material-symbols-outlined text-on-surface-variant opacity-30 text-[18px]';
    openIcon.textContent = 'chevron_right';

    row.appendChild(checkBox);
    row.appendChild(dot);
    row.appendChild(title);
    row.appendChild(tags);
    row.appendChild(openIcon);
    card.appendChild(row);

    // Click to open task detail modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (e.target.closest('.priority-dot')) return;
      if (e.target.tagName === 'INPUT') return;
      if (e.target.closest('.w-5.h-5')) return;
      app.setCurrentTodo(todo.id);
      openTaskDetailModal(todo);
    });

    todoList.appendChild(card);
  });
}

// ─── Task Detail Modal ────────────────────────────────────────────
let currentDetailTodoId = null;

function openTaskDetailModal(todo) {
  if (!todo) return;
  currentDetailTodoId = todo.id;
  renderTaskDetail(todo);
  taskDetailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTaskDetailModal() {
  // Clean up time tracking if active
  if (timeTrackingInterval) {
    clearInterval(timeTrackingInterval);
    timeTrackingInterval = null;
  }
  taskDetailModal.classList.add('hidden');
  currentDetailTodoId = null;
  document.body.style.overflow = '';
}

function renderTaskDetail(todo) {
  if (!todo) {
    const refreshed = app.currentProject?.getTodo(currentDetailTodoId);
    if (!refreshed) { closeTaskDetailModal(); return; }
    todo = refreshed;
  }

  const proj = app.currentProject;

  // Breadcrumb
  detailBreadcrumbProject.textContent = proj?.name || 'Projects';
  detailBreadcrumbTitle.textContent = todo.title;

  // Title
  detailTitle.textContent = todo.title;

  // Priority badge
  detailPriorityBadge.textContent = todo.priorityLabel + ' Priority';
  detailPriorityBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
    todo.priority === 'high' ? 'bg-error/15 text-error border border-error/30' :
    todo.priority === 'medium' ? 'bg-secondary-container/50 text-on-secondary-container border border-secondary-container' :
    'bg-surface-variant text-on-surface-variant border border-outline-variant'
  }`;

  // Assignee avatar area
  if (todo.assignee) {
    const initial = todo.assignee.charAt(0).toUpperCase();
    detailAssigneeAvatar.innerHTML = `<span class="text-primary text-xs font-bold">${initial}</span>`;
    detailAssigneeAvatar.className = 'size-8 rounded-full border-2 border-surface-container-lowest bg-primary/10 flex items-center justify-center';
    detailAssigneeName.textContent = todo.assignee;
  } else {
    detailAssigneeAvatar.innerHTML = '<span class="material-symbols-outlined text-primary text-sm">person</span>';
    detailAssigneeAvatar.className = 'size-8 rounded-full border-2 border-surface-container-lowest bg-primary/10 flex items-center justify-center';
    detailAssigneeName.textContent = 'Unassigned';
  }

  // Description
  if (todo.description) {
    detailDescription.innerHTML = `<p class="text-on-surface leading-relaxed">${todo.description.replace(/\n/g, '<br>')}</p>`;
  } else {
    detailDescription.innerHTML = '<p class="text-on-surface-variant italic">No description provided.</p>';
  }

  // Checklist (subtasks)
  renderDetailChecklist(todo);

  // Notes
  if (todo.notes) {
    detailNotesSection.classList.remove('hidden');
    detailNotes.innerHTML = `<p class="text-on-surface text-sm">${todo.notes.replace(/\n/g, '<br>')}</p>`;
  } else {
    detailNotesSection.classList.add('hidden');
  }

  // Sidebar
  detailSidebarAssignee.textContent = todo.assignee || 'Unassigned';
  detailSidebarDuedate.textContent = todo.formattedDueDate;
  detailSidebarDuedate.className = `text-sm font-medium ${todo.isOverdue ? 'text-error' : 'text-on-surface'}`;
  detailSidebarProject.textContent = proj?.name || '—';
  detailSidebarPriority.textContent = todo.priorityLabel;

  // Tags
  detailTags.innerHTML = '';
  if (todo.tags && todo.tags.length > 0) {
    todo.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'px-2 py-1 bg-surface-container-high text-[11px] font-bold rounded border border-outline-variant/50 text-on-surface-variant';
      span.textContent = tag;
      detailTags.appendChild(span);
    });
  } else {
    detailTags.innerHTML = '<span class="text-xs text-on-surface-variant italic">No tags</span>';
  }

  // Time tracking
  const total = todo.timeEstimate || 0;
  const spent = todo.timeSpent || 0;
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  detailTimeSpent.innerHTML = `${spent}h <span class="text-on-surface-variant text-sm font-normal">/ ${total}h total</span>`;
  detailTimePercent.textContent = `${pct}% complete`;
  detailTimeBar.style.width = `${pct}%`;

  // Attachments
  renderDetailAttachments(todo);

  // Comments
  renderDetailComments(todo);
}

function renderDetailChecklist(todo) {
  const items = todo.checklist || [];
  const done = items.filter((i) => i.done).length;
  detailChecklistTitle.textContent = `Subtasks (${done}/${items.length})`;

  detailChecklist.innerHTML = '';
  if (items.length === 0) {
    detailChecklist.innerHTML = '<p class="text-sm text-on-surface-variant italic opacity-60">No subtasks yet.</p>';
    return;
  }

  items.forEach((item, idx) => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-transparent hover:border-outline-variant/50 cursor-pointer group transition-all';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done;
    cb.className = 'w-5 h-5 rounded border-outline-variant bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer';
    cb.addEventListener('change', () => {
      app.toggleChecklistItem(todo.id, idx);
      renderDetailChecklist(todo);
      render();
    });

    const text = document.createElement('span');
    text.className = `text-sm ${item.done ? 'text-on-surface-variant line-through group-hover:text-on-surface' : 'text-on-surface group-hover:text-primary'}`;
    text.textContent = item.text;

    label.appendChild(cb);
    label.appendChild(text);
    detailChecklist.appendChild(label);
  });
}

function renderDetailAttachments(todo) {
  const attachments = todo.attachments || [];
  detailAttachments.innerHTML = '';

  if (attachments.length === 0) {
    // Show an upload placeholder
    const placeholder = document.createElement('button');
    placeholder.className = 'aspect-video rounded-lg border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center hover:border-primary transition-colors text-on-surface-variant hover:text-primary cursor-pointer col-span-full';
    placeholder.innerHTML = `
      <span class="material-symbols-outlined text-2xl">add_circle</span>
      <span class="text-[10px] font-bold uppercase mt-1">Add File</span>
    `;
    placeholder.addEventListener('click', () => {
      const name = prompt('Enter file name:');
      if (name && name.trim()) {
        todo.addAttachment(name.trim(), 'file');
        renderTaskDetail();
        render();
      }
    });
    detailAttachments.appendChild(placeholder);
    return;
  }

  attachments.forEach((att) => {
    const div = document.createElement('div');
    div.className = 'group relative aspect-video rounded-lg overflow-hidden border border-outline-variant/50 bg-surface-container-low cursor-pointer';

    const typeIcon = att.type === 'image' ? 'image' : 'description';
    div.innerHTML = `
      <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span class="material-symbols-outlined text-3xl text-on-surface-variant mb-1">${typeIcon}</span>
        <span class="text-[10px] text-on-surface-variant font-medium truncate max-w-full">${att.name}</span>
      </div>
      <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-white">download</span>
      </div>
    `;
    detailAttachments.appendChild(div);
  });

  // Add file button
  const addBtn = document.createElement('button');
  addBtn.className = 'aspect-video rounded-lg border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center hover:border-primary transition-colors text-on-surface-variant hover:text-primary cursor-pointer';
  addBtn.innerHTML = `
    <span class="material-symbols-outlined text-2xl">add_circle</span>
    <span class="text-[10px] font-bold uppercase mt-1">Add File</span>
  `;
  addBtn.addEventListener('click', () => {
    const name = prompt('Enter file name:');
    if (name && name.trim()) {
      todo.addAttachment(name.trim(), 'file');
      renderTaskDetail();
      render();
    }
  });
  detailAttachments.appendChild(addBtn);
}

function renderDetailComments(todo) {
  const comments = todo.comments || [];
  detailComments.innerHTML = '';

  if (comments.length === 0) {
    detailComments.innerHTML = '<p class="text-sm text-on-surface-variant italic text-center py-4 opacity-60">No activity yet.</p>';
    return;
  }

  // Show newest first
  const sorted = [...comments].reverse();
  sorted.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'flex gap-3';

    const avatar = document.createElement('div');
    avatar.className = 'size-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0';
    avatar.innerHTML = `<span class="text-[10px] font-bold text-primary">${c.author?.charAt(0).toUpperCase() || '?'}</span>`;

    const body = document.createElement('div');
    body.className = 'space-y-1';

    const meta = document.createElement('div');
    meta.className = 'flex items-center gap-2';
    const author = document.createElement('span');
    author.className = 'text-xs font-bold text-on-surface';
    author.textContent = c.author || 'Unknown';
    const time = document.createElement('span');
    time.className = 'text-[10px] text-on-surface-variant opacity-60';
    time.textContent = getTimeAgo(c.timestamp);
    meta.appendChild(author);
    meta.appendChild(time);

    const bubble = document.createElement('div');
    bubble.className = 'bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 text-sm text-on-surface-variant';
    bubble.textContent = c.text;

    body.appendChild(meta);
    body.appendChild(bubble);
    div.appendChild(avatar);
    div.appendChild(body);
    detailComments.appendChild(div);
  });
}

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(date, 'MMM d');
}

// ─── Detail Modal Event Wiring ────────────────────────────────────
closeTaskDetail?.addEventListener('click', () => {
  app.setCurrentTodo(null);
  closeTaskDetailModal();
  render();
});

taskDetailModal?.addEventListener('click', (e) => {
  if (e.target === taskDetailModal) {
    app.setCurrentTodo(null);
    closeTaskDetailModal();
    render();
  }
});

detailEditBtn?.addEventListener('click', () => {
  const todo = app.currentProject?.getTodo(currentDetailTodoId);
  if (!todo) return;
  closeTaskDetailModal();
  openEditTodoModal(todo);
});

detailDeleteBtn?.addEventListener('click', () => {
  const todo = app.currentProject?.getTodo(currentDetailTodoId);
  if (!todo) return;
  closeTaskDetailModal();
  openConfirm('Delete Task', `Are you sure you want to delete "${todo.title}"?`, () => {
    app.removeTodo(todo.id);
    render();
  });
});

detailAddSubtaskBtn?.addEventListener('click', () => {
  const todo = app.currentProject?.getTodo(currentDetailTodoId);
  if (!todo) return;
  const text = prompt('Enter subtask name:');
  if (text && text.trim()) {
    app.addChecklistItem(todo.id, text.trim());
    renderTaskDetail();
    render();
  }
});

detailSendCommentBtn?.addEventListener('click', () => {
  const todo = app.currentProject?.getTodo(currentDetailTodoId);
  if (!todo) return;
  const text = detailCommentInput.value.trim();
  if (!text) return;
  todo.addComment('You', text);
  detailCommentInput.value = '';
  renderTaskDetail();
  render();
});

detailCommentInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    detailSendCommentBtn?.click();
  }
});

detailBreadcrumbProject?.addEventListener('click', () => {
  app.setCurrentTodo(null);
  closeTaskDetailModal();
  render();
});

// ─── Time Tracking Play Button ────────────────────────────────────
let timeTrackingInterval = null;

detailTimePlayBtn?.addEventListener('click', () => {
  const todo = app.currentProject?.getTodo(currentDetailTodoId);
  if (!todo) return;

  if (timeTrackingInterval) {
    // Stop tracking
    clearInterval(timeTrackingInterval);
    timeTrackingInterval = null;
    detailTimePlayBtn.innerHTML = '<span class="material-symbols-outlined text-lg" style="font-variation-settings: \'FILL\' 1;">play_arrow</span>';
    detailTimePlayBtn.className = 'size-8 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-primary/20 cursor-pointer';
  } else {
    // Start tracking - increment timeSpent every minute
    detailTimePlayBtn.innerHTML = '<span class="material-symbols-outlined text-lg" style="font-variation-settings: \'FILL\' 1;">pause</span>';
    detailTimePlayBtn.className = 'size-8 bg-error rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-error/20 cursor-pointer animate-pulse';

    timeTrackingInterval = setInterval(() => {
      const t = app.currentProject?.getTodo(currentDetailTodoId);
      if (!t || taskDetailModal.classList.contains('hidden')) {
        clearInterval(timeTrackingInterval);
        timeTrackingInterval = null;
        return;
      }
      t.timeSpent = (t.timeSpent || 0) + 1;
      renderTaskDetail();
      render();
    }, 60000); // every minute
  }
});

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
    else if (!taskDetailModal.classList.contains('hidden')) { app.setCurrentTodo(null); closeTaskDetailModal(); render(); }
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
