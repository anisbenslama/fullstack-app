// Configuration
const API_URL = '';  // Vide = utilise le proxy Nginx

// Affichage de l'URL API
document.getElementById('apiUrl').textContent = API_URL || '/api (via Nginx)';

// Notification
function showNotification(message, type = 'success') {
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// Mise à jour des statistiques
function updateStats(tasks) {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completedTasks').textContent = completed;
}

// Formatage de la date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Label du statut
function getStatusLabel(status) {
    const labels = {
        'pending': '📝 À faire',
        'in_progress': '🔄 En cours',
        'completed': '✅ Terminé'
    };
    return labels[status] || status;
}

// Échappement HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Chargement des tâches
async function loadTasks() {
    const container = document.getElementById('tasks');
    container.innerHTML = '<div class="loading">⏳ Chargement des tâches...</div>';
    
    try {
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const tasks = await response.json();
        console.log('Tâches chargées:', tasks);
        
        updateStats(tasks);
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">✨ Aucune tâche. Créez votre première tâche !</div>';
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div class="task-card" data-id="${task.id}">
                <h3>${escapeHtml(task.title)}</h3>
                ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="status-badge status-${task.status}">${getStatusLabel(task.status)}</span>
                    <small>📅 ${formatDate(task.created_at)}</small>
                </div>
                <div class="task-actions">
                    <select class="status-select" data-id="${task.id}">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>📝 À faire</option>
                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>🔄 En cours</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>✅ Terminé</option>
                    </select>
                    <button class="delete-btn" data-id="${task.id}">🗑️ Supprimer</button>
                </div>
            </div>
        `).join('');
        
        // Ajout des événements
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTask(btn.dataset.id));
        });
        
    } catch (error) {
        console.error('Erreur chargement:', error);
        container.innerHTML = `<div class="error">❌ Erreur de connexion au serveur. Vérifiez que le backend est démarré.</div>`;
    }
}

// Changement de statut
async function handleStatusChange(e) {
    const select = e.target;
    const taskId = select.dataset.id;
    const newStatus = select.value;
    
    try {
        // Récupérer la tâche actuelle
        const taskResponse = await fetch(`/api/tasks/${taskId}`);
        const task = await taskResponse.json();
        
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: task.title,
                description: task.description || '',
                status: newStatus
            })
        });
        
        if (!response.ok) throw new Error('Erreur mise à jour');
        
        showNotification('✅ Statut mis à jour avec succès', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la mise à jour du statut', 'error');
        loadTasks(); // Recharge pour annuler le changement visuel
    }
}

// Création d'une tâche
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;
    
    if (!title) {
        showNotification('❌ Le titre est requis', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur création');
        }
        
        document.getElementById('taskForm').reset();
        showNotification('✅ Tâche créée avec succès !', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la création de la tâche', 'error');
    }
});

// Suppression d'une tâche
async function deleteTask(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur suppression');
        
        showNotification('✅ Tâche supprimée avec succès', 'success');
        loadTasks();
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la suppression', 'error');
    }
}

// Chargement initial
loadTasks();

// Rafraîchissement automatique toutes les 30 secondes
setInterval(loadTasks, 30000);
