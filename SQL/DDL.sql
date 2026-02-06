-- ========================================
-- 시니어 일정 관리 앱 - DDL
-- ========================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS senior_schedule 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE senior_schedule;

-- ----------------------------------------
-- 1. 사용자 테이블
-- ----------------------------------------
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- 2. 일정 카테고리 테이블
-- ----------------------------------------
CREATE TABLE `schedule_category` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `icon` VARCHAR(50) NULL,
    `color` VARCHAR(7) NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `sort_order` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- 3. 일정 테이블
-- ----------------------------------------
CREATE TABLE `schedule` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `category_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `schedule_date` DATE NOT NULL,
    `schedule_time` TIME NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'MISSED') NOT NULL DEFAULT 'PENDING',
    `remind_before` INT NOT NULL DEFAULT 30,
    `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
    `recurring_type` VARCHAR(20) NULL,
    `recurring_end_date` DATE NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_schedule_date` (`schedule_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_user_date` (`user_id`, `schedule_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `schedule_category`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- 4. 일정 이력 테이블
-- ----------------------------------------
CREATE TABLE `schedule_log` (
    `id` VARCHAR(36) NOT NULL,
    `schedule_id` VARCHAR(36) NOT NULL,
    `action` ENUM('CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED') NOT NULL,
    `old_status` VARCHAR(20) NULL,
    `new_status` VARCHAR(20) NULL,
    `action_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `note` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_schedule_id` (`schedule_id`),
    INDEX `idx_action_at` (`action_at`),
    FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------
-- 기본 사용자 데이터 삽입 (로그인 없이 사용)
-- ----------------------------------------
INSERT INTO `users` (`id`, `username`, `password`, `name`, `phone`) VALUES
('default-user', 'default', '', '사용자', NULL);

-- ----------------------------------------
-- 기본 카테고리 데이터 삽입
-- ----------------------------------------
INSERT INTO `schedule_category` (`id`, `name`, `icon`, `color`, `is_default`, `sort_order`) VALUES
(UUID(), '병원', '🏥', '#E53935', TRUE, 1),
(UUID(), '약 복용', '💊', '#43A047', TRUE, 2),
(UUID(), '운동', '🏃', '#1E88E5', TRUE, 3),
(UUID(), '가족', '👨‍👩‍👧', '#FB8C00', TRUE, 4),
(UUID(), '기타', '📅', '#757575', TRUE, 5);
