class TaskUI {
    constructor(storage) {
        this.storage = storage;
        this.currentFilter = {category: 'all', priority: 'all', status: 'all', search: ''};
        this.currentSort = 'date';
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const priorityColor = {high: '#e74c3c', medium: '#f39c12', low: '#2ecc71'}[task.priority] || '#95a5a6';
        li.style.borderLeftColor = priorityColor;

        let metaHTML = '';
        if (task.category) metaHTML += `<span class="task-category">#${task.category}</span>`;
        if (task.priority) {
            const emoji = {high: '🔴', medium: '🟡', low: '🟢'}[task.priority] || '';
            metaHTML += `<span class="task-priority ${task.priority}">${emoji} ${task.priority}</span>`;
        }
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            metaHTML += `<span class="task-duedate">📅 ${dueDate.toLocaleDateString()}</span>`;
        }

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.name)}</div>
                ${metaHTML ? `<div class="task-meta">${metaHTML}</div>` : ''}
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit" data-id="${task.id}">✏️</button>
                <button class="task-action-btn delete" data-id="${task.id}">🗑️</button>
            </div>
        `;

        return li;
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        let tasks = this.storage.getAllTasks();

        if (this.currentFilter.category !== 'all') {
            tasks = tasks.filter(t => t.category === this.currentFilter.category);
        }
        if (this.currentFilter.priority !== 'all') {
            tasks = tasks.filter(t => t.priority === this.currentFilter.priority);
        }
        if (this.currentFilter.status === 'completed') {
            tasks = tasks.filter(t => t.completed);
        } else if (this.currentFilter.status === 'pending') {
            tasks = tasks.filter(t => !t.completed);
        }
        if (this.currentFilter.search) {
            tasks = tasks.filter(t => t.name.toLowerCase().includes(this.currentFilter.search.toLowerCase()));
        }

        if (tasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tasksList.innerHTML = '';
        tasks.forEach(task => tasksList.appendChild(this.createTaskElement(task)));
    }

    updateStatistics() {
        const stats = this.storage.getStatistics();
        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('progressPercent').textContent = `${stats.percentageComplete}%`;
    }

    updateCategories() {
        const categories = this.storage.getCategories();
        const list = document.getElementById('categoriesList');
        const existing = list.querySelectorAll('.category-btn:not([data-category="all"])');
        existing.forEach(btn => btn.remove());

        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category;
            btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            btn.addEventListener('click', () => this.filterByCategory(category));
            list.appendChild(btn);
        });
    }

    filterByCategory(category) {
        this.currentFilter.category = category;
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.renderTasks();
    }

    filterByPriority(priority) {
        this.currentFilter.priority = priority;
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });
        this.renderTasks();
    }

    filterByStatus(status) {
        this.currentFilter.status = status;
        this.renderTasks();
    }

    searchTasks(query) {
        this.currentFilter.search = query;
        this.renderTasks();
    }

    toggleTheme() {
        const currentTheme = this.storage.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.storage.setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('themeToggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showEditModal(taskId) {
        const task = this.storage.getTask(taskId);
        if (!task) return;
        document.getElementById('editTaskInput').value = task.name;
        document.getElementById('editCategorySelect').value = task.category || '';
        document.getElementById('editPrioritySelect').value = task.priority || 'low';
        document.getElementById('editDueDateInput').value = task.dueDate || '';
        const modal = document.getElementById('editModal');
        modal.classList.add('active');
        modal.dataset.taskId = taskId;
    }

    hideEditModal() {
        document.getElementById('editModal').classList.remove('active');
    }

    showAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.add('active');
    }

    hideAddCategoryModal() {
        document.getElementById('addCategoryModal').classList.remove('active');
        document.getElementById('newCategoryInput').value = '';
    }
}
