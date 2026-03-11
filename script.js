// Todo List Application
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // 获取DOM元素
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.emptyState = document.getElementById('emptyState');

        // 绑定事件
        this.bindEvents();
        
        // 初始渲染
        this.render();
    }

    bindEvents() {
        // 添加任务
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // 过滤任务
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // 清除已完成
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) {
            this.shakeInput();
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
        this.focusInput();
    }

    shakeInput() {
        this.todoInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            this.todoInput.style.animation = '';
        }, 500);
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }

    clearCompleted() {
        const completedItems = document.querySelectorAll('.todo-item.completed');
        completedItems.forEach(item => {
            item.style.animation = 'fadeOut 0.3s ease forwards';
        });

        setTimeout(() => {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }, 300);
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        
        // 小于1小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }
        
        // 小于24小时
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }
        
        // 小于7天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }
        
        // 其他
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // 清空列表
        this.todoList.innerHTML = '';

        // 显示/隐藏空状态
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.todoList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.todoList.style.display = 'block';
            
            // 渲染任务
            filteredTodos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                li.dataset.id = todo.id;
                li.style.animationDelay = `${index * 0.05}s`;

                li.innerHTML = `
                    <div class="checkbox" onclick="app.toggleTodo(${todo.id})">
                        <i class="fas fa-check"></i>
                    </div>
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

                this.todoList.appendChild(li);
            });
        }

        // 更新统计
        this.updateStats();
        
        // 更新清除按钮状态
        this.updateClearButton();
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }

    updateClearButton() {
        const hasCompleted = this.todos.some(todo => todo.completed);
        this.clearCompletedBtn.disabled = !hasCompleted;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    focusInput() {
        this.todoInput.focus();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new TodoApp();
