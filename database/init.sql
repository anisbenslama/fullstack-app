-- Création de la table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de démonstration
INSERT INTO tasks (title, description, status) VALUES 
('Bienvenue sur TaskFlow', 'Votre application de gestion de tâches est prête !', 'completed'),
('Découvrir l''API', 'Testez les endpoints /api/tasks avec curl ou Postman', 'pending'),
('Explorer Kubernetes', 'Déployez l''application sur K3s', 'in_progress');
