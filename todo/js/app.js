class TodoApp {
    constructor() {
        this.storage = new TaskStorage();
        this.ui = new TaskUI(this.storage);
        this.init();
    }

    init() {
        const theme = this.storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
        this.ui.updateStatistics();
        this.ui.updateCategories();
        this.ui.renderTasks();
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.getElementById('themeToggle').addEventListener('click', () => this.ui.toggleTheme());

        document.getElementById('tasksList').addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(parseInt(e.target.dataset.id));
            }
        });

        document.getElementById('tasksList').addEventListener('click', (e) => {
            if (e.target.classList.contains('edit')) {
                this.ui.showEditModal(parseInt(e.target.dataset.id));
            }
            if (e.target.classList.contains('delete')) {
                this.deleteTask(parseInt(e.target.dataset.id));
            }
        });

        document.getElementById('closeEditModal').addEventListener('click', () => this.ui.hideEditModal());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.ui.hideEditModal());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdit());

        document.getElementById('addCategoryBtn').addEventListener('click', () => this.ui.showAddCategoryModal());
        document.getElementById('closeAddCategoryModal').addEventListener('click', () => this.ui.hideAddCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.ui.hideAddCategoryModal());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.ui.searchTasks(e.target.value);
        });

        document.getElementById('filterToggleBtn').addEventListener('click', () => {
            const panel = document.getElementById('filtersPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        document.querySelectorAll('input[name="status"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.ui.filterByStatus(e.target.value));
        });

        document.querySelectorAll('.category-btn[data-category="all"]').forEach(btn => {
            btn.addEventListener('click', () => this.ui.filterByCategory('all'));
        });

        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.ui.filterByPriority(e.target.dataset.priority));
        });

        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
        document.getElementById('deleteAllBtn').addEventListener('click', () => this.deleteAll());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ui.hideEditModal();
                this.ui.hideAddCategoryModal();
            }
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const taskName = input.value.trim();

        if (!taskName) {
            alert('Please enter a task name');
            input.focus();
            return;
        }

        const category = document.getElementById('categorySelect').value;
        const priority = document.getElementById('prioritySelect').value;
        const dueDate = document.getElementById('dueDateInput').value;

        this.storage.addTask({
            name: taskName,
            category: category || null,
            priority: priority || null,
            dueDate: dueDate || null
        });

        input.value = '';
        document.getElementById('categorySelect').value = '';
        document.getElementById('prioritySelect').value = '';
        document.getElementById('dueDateInput').value = '';

        this.ui.updateStatistics();
        this.ui.renderTasks();
        input.focus();
    }

    toggleTask(taskId) {
        const task = this.storage.getTask(taskId);
        if (task) {
            this.storage.updateTask(taskId, {completed: !task.completed});
            this.ui.updateStatistics();
            this.ui.renderTasks();
        }
    }

    saveEdit() {
        const modal = document.getElementById('editModal');
        const taskId = parseInt(modal.dataset.taskId);
        const name = document.getElementById('editTaskInput').value.trim();
        const category = document.getElementById('editCategorySelect').value;
        const priority = document.getElementById('editPrioritySelect').value;
        const dueDate = document.getElementById('editDueDateInput').value;

        if (!name) {
            alert('Task name cannot be empty');
            return;
        }

        this.storage.updateTask(taskId, {name, category: category || null, priority: priority || null, dueDate: dueDate || null});
        this.ui.hideEditModal();
        this.ui.updateStatistics();
        this.ui.renderTasks();
    }

    deleteTask(taskId) {
        if (confirm('Delete this task?')) {
            this.storage.deleteTask(taskId);
            this.ui.updateStatistics();
            this.ui.renderTasks();
        }
    }

    saveCategory() {
        const input = document.getElementById('newCategoryInput');
        const categoryName = input.value.trim().toLowerCase();

        if (!categoryName) {
            alert('Please enter a category name');
            return;
        }

        if (this.storage.addCategory(categoryName)) {
            this.ui.updateCategories();
            this.ui.hideAddCategoryModal();
        } else {
            alert('Category already exists');
        }
    }

    clearCompleted() {
        const count = this.storage.getCompletedTasks().length;
        if (count === 0) {
            alert('No completed tasks');
            return;
        }
        if (confirm(`Delete ${count} completed task(s)?`)) {
            this.storage.clearCompleted();
            this.ui.updateStatistics();
            this.ui.renderTasks();
        }
    }

    deleteAll() {
        const count = this.storage.getAllTasks().length;
        if (count === 0) {
            alert('No tasks');
            return;
        }
        if (confirm(`Delete ALL ${count} tasks?`) && confirm('Really?')) {
            this.storage.deleteAll();
            this.ui.updateStatistics();
            this.ui.renderTasks();
        }
    }

    exportTasks() {
        const tasks = this.storage.getAllTasks();
        if (tasks.length === 0) {
            alert('No tasks to export');
            return;
        }
        const json = this.storage.exportTasks();
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`Exported ${tasks.length} task(s)`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
    console.log('✓ To-Do List App loaded!');
});
