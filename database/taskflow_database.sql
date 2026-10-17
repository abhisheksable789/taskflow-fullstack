CREATE DATABASE IF NOT EXISTS taskflow_db;

USE taskflow_db;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    project VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High')
        NOT NULL DEFAULT 'Medium',
    status ENUM('To Do', 'In Progress', 'Done')
        NOT NULL DEFAULT 'To Do',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
