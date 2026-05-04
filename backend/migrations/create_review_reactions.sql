-- Таблица для хранения реакций пользователей на отзывы
CREATE TABLE IF NOT EXISTS review_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    review_id INT NOT NULL,
    reaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_review (user_id, review_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Добавляем счетчики лайков и дизлайков в таблицу отзывов
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislikes_count INT DEFAULT 0;
