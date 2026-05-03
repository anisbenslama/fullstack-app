// Backend API URL
const API_URL = 'http://localhost:3000';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const completedTasksEl = document.getElementById('completedTasks');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeBtn = document.querySelector('.close');

let currentEditId = null;

// Fetch all tasks
async function fetchTasks() {
    try {
        console.log('Fetching from:', `${API_URL}/api/tasks`);
        const response = await fetch(`${API_URL}/api/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        console.log('Tasks received:', tasks);
        displayTasks(tasks);
        updateStats(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksList.innerHTML = '<div class="loading">⚠️ Cannot connect to backend. Make sure backend is running on port 3000</div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="loading">No tasks yet. Create your first task!</div>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-description">${escapeHtml(task.description)}</div>
                <div class="task-status status-${task.status}">
                    ${task.status === 'pending' ? '🟡 Pending' : '✅ Completed'}
                </div>
                <div class="task-date">Created: ${new Date(task.created_at).toLocaleDateString()}</div>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats(tasks) {
    totalTasksEl.textContent = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    pendingTasksEl.textContent = pending;
    completedTasksEl.textContent = completed;
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    
    if (!title || !description) {
        alert('Please fill in both title and description');
        return;
    }
    
    try {
        console.log('Creating task:', {title, description});
        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        
        taskForm.reset();
        fetchTasks();
        alert('✅ Task created successfully!');
    } catch (error) {
        console.error('Error creating task:', error);
        alert('❌ Error creating task. Please try again.');
    }
});

// Edit task
window.editTask = async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/tasks`);
        const tasks = await response.json();
        const task = tasks.find(t => t.id === id);
        
        if (task) {
            currentEditId = id;
            document.getElementById('editTitle').value = task.title;
            document.getElementById('editDescription').value = task.description;
            document.getElementById('editStatus').value = task.status;
            editModal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading task:', error);
        alert('Error loading task for editing');
    }
};

// Update task
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const status = document.getElementById('editStatus').value;
    
    try {
        const response = await fetch(`${API_URL}/api/tasks/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        editModal.style.display = 'none';
        fetchTasks();
        alert('✅ Task updated successfully!');
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    }
});

// Delete task
window.deleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete task');
            
            fetchTasks();
            alert('✅ Task deleted successfully!');
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error deleting task. Please try again.');
        }
    }
};

// Close modal
closeBtn.onclick = () => {
    editModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
};

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load tasks on page load
fetchTasks();

// Refresh tasks every 30 seconds
setInterval(fetchTasks, 30000);
