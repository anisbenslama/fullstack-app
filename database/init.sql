-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Insert sample data (only if table is empty)
INSERT INTO tasks (title, description, status)
SELECT 'Complete Docker project', 'Finish the multi-tier application with Docker Compose', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Complete Docker project');

INSERT INTO tasks (title, description, status)
SELECT 'Write documentation', 'Create comprehensive README with all test results', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Write documentation');

INSERT INTO tasks (title, description, status)
SELECT 'Test application', 'Perform all validation tests and capture screenshots', 'completed'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Test application');

INSERT INTO tasks (title, description, status)
SELECT 'Deploy to production', 'Set up CI/CD pipeline for automatic deployment', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Deploy to production');

-- Verify data was inserted
DO $$
DECLARE
    task_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks;
    RAISE NOTICE 'Database initialized with % tasks', task_count;
END $$;
