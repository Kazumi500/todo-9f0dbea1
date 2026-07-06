import { format, parseISO, isValid, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Generate a unique ID with a fallback for environments without crypto.randomUUID.
 * @returns {string}
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers / non-secure contexts
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Creates a new Todo object.
 * @param {string} title
 * @param {string} description
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @param {'low'|'medium'|'high'} priority
 * @param {string} notes
 * @param {Array<{text: string, done: boolean}>} checklist
 * @returns {object} todo
 */
export function createTodo(
  title,
  description = '',
  dueDate = '',
  priority = 'medium',
  notes = '',
  checklist = []
) {
  return {
    id: generateId(),
    title,
    description,
    dueDate,
    priority,
    notes,
    checklist,
    completed: false,
    createdAt: new Date().toISOString(),

    // Methods
    toggleComplete() {
      this.completed = !this.completed;
    },

    setPriority(newPriority) {
      this.priority = newPriority;
    },

    update({ title, description, dueDate, priority, notes, checklist }) {
      if (title !== undefined) this.title = title;
      if (description !== undefined) this.description = description;
      if (dueDate !== undefined) this.dueDate = dueDate;
      if (priority !== undefined) this.priority = priority;
      if (notes !== undefined) this.notes = notes;
      if (checklist !== undefined) this.checklist = checklist;
    },

    addChecklistItem(text) {
      this.checklist.push({ text, done: false });
    },

    toggleChecklistItem(index) {
      if (this.checklist[index]) {
        this.checklist[index].done = !this.checklist[index].done;
      }
    },

    removeChecklistItem(index) {
      this.checklist.splice(index, 1);
    },

    get formattedDueDate() {
      if (!this.dueDate) return 'No due date';
      try {
        const date = parseISO(this.dueDate);
        if (!isValid(date)) return 'Invalid date';
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'MMM d, yyyy');
      } catch {
        return 'Invalid date';
      }
    },

    get isOverdue() {
      if (!this.dueDate) return false;
      try {
        const date = parseISO(this.dueDate);
        return isPast(date) && !isToday(date);
      } catch {
        return false;
      }
    },

    get priorityLabel() {
      return this.priority.charAt(0).toUpperCase() + this.priority.slice(1);
    },

    get priorityColor() {
      switch (this.priority) {
        case 'high': return 'red';
        case 'medium': return 'yellow';
        case 'low': return 'green';
        default: return 'gray';
      }
    },
  };
}

/**
 * Rehydrate a plain JSON object into a full todo with methods.
 * @param {object} data - raw JSON todo data from localStorage
 * @returns {object} todo with methods attached
 */
export function rehydrateTodo(data) {
  const todo = createTodo(
    data.title,
    data.description,
    data.dueDate,
    data.priority,
    data.notes,
    data.checklist
  );
  todo.id = data.id;
  todo.completed = data.completed;
  todo.createdAt = data.createdAt;
  return todo;
}
