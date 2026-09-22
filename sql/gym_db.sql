-- Cơ sở dữ liệu hệ thống quản lý phòng gym
CREATE DATABASE IF NOT EXISTS gym_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gym_db;
SET NAMES utf8mb4;

-- Xóa bảng theo thứ tự phụ thuộc (con trước, cha sau)
DROP TABLE IF EXISTS class_registrations;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS class_sessions;
DROP TABLE IF EXISTS equipments;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS trainers;
DROP TABLE IF EXISTS gym_packages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TRAINER', 'MEMBER') NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    dob DATE,
    gender ENUM('MALE', 'FEMALE'),
    address VARCHAR(255),
    avatar_url VARCHAR(255),
    join_date DATE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE trainers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    specialty VARCHAR(100),
    experience_years INT,
    salary DOUBLE,
    CONSTRAINT fk_trainers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE gym_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DOUBLE NOT NULL,
    duration_months INT NOT NULL,
    description TEXT
);

CREATE TABLE registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT,
    package_id BIGINT,
    start_date DATE,
    end_date DATE,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED'),
    CONSTRAINT fk_registrations_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_package FOREIGN KEY (package_id) REFERENCES gym_packages (id) ON DELETE RESTRICT
);

CREATE TABLE class_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    trainer_id BIGINT,
    day_of_week VARCHAR(10),
    start_time TIME,
    end_time TIME,
    max_capacity INT,
    CONSTRAINT fk_class_sessions_trainer FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE RESTRICT
);

CREATE TABLE class_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT,
    class_session_id BIGINT,
    registered_at DATETIME,
    CONSTRAINT fk_class_regs_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE RESTRICT,
    CONSTRAINT fk_class_regs_session FOREIGN KEY (class_session_id) REFERENCES class_sessions (id) ON DELETE RESTRICT
);

CREATE TABLE equipments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    quantity INT,
    status ENUM('OK', 'REPAIRING', 'BROKEN'),
    image_url VARCHAR(255)
);

-- Dữ liệu mẫu: 1 ADMIN, 2 TRAINER, 2 MEMBER
INSERT INTO users (username, password, role, full_name, email, phone) VALUES
('admin', '123456', 'ADMIN', 'Nguyễn Văn Admin', 'admin@gym.local', '0901000001'),
('trainer1', '123456', 'TRAINER', 'Trần Minh Huấn', 'trainer1@gym.local', '0901000002'),
('trainer2', '123456', 'TRAINER', 'Lê Thị Yoga', 'trainer2@gym.local', '0901000003'),
('member1', '123456', 'MEMBER', 'Phạm Quốc Hội', 'member1@gym.local', '0901000004'),
('member2', '123456', 'MEMBER', 'Đỗ Thị Lan', 'member2@gym.local', '0901000005');

INSERT INTO members (user_id, dob, gender, address, avatar_url, join_date) VALUES
(4, '2002-05-12', 'MALE', '12 Nguyễn Huệ, Q.1, TP.HCM', '/avatars/member1.jpg', '2025-01-15'),
(5, '2001-11-03', 'FEMALE', '45 Lê Lợi, Q.3, TP.HCM', '/avatars/member2.jpg', '2025-03-01');

INSERT INTO trainers (user_id, specialty, experience_years, salary) VALUES
(2, 'Strength Training', 5, 15000000),
(3, 'Yoga & Pilates', 3, 12000000);

INSERT INTO gym_packages (name, price, duration_months, description) VALUES
('Gói 1 tháng', 500000, 1, 'Tập không giới hạn trong 1 tháng'),
('Gói 3 tháng', 1350000, 3, 'Tiết kiệm so với gói tháng, phù hợp người mới'),
('Gói 6 tháng', 2400000, 6, 'Ưu đãi trung hạn, kèm 2 buổi PT'),
('Gói 12 tháng', 4200000, 12, 'Gói năm, kèm 8 buổi PT và đánh giá thể lực');

-- end_date = start_date + duration_months của gói tương ứng
INSERT INTO registrations (member_id, package_id, start_date, end_date, status) VALUES
(1, 1, '2026-01-01', '2026-02-01', 'EXPIRED'),
(1, 4, '2026-02-15', '2027-02-15', 'ACTIVE'),
(2, 2, '2026-03-01', '2026-06-01', 'ACTIVE'),
(2, 3, '2025-06-01', '2025-12-01', 'CANCELLED');

INSERT INTO class_sessions (name, trainer_id, day_of_week, start_time, end_time, max_capacity) VALUES
('HIIT Morning', 1, 'MONDAY', '07:00:00', '08:00:00', 20),
('Yoga Flow', 2, 'WEDNESDAY', '18:00:00', '19:00:00', 15),
('Strength Circuit', 1, 'FRIDAY', '19:00:00', '20:30:00', 12),
('Pilates Core', 2, 'SATURDAY', '09:00:00', '10:00:00', 10);

INSERT INTO class_registrations (member_id, class_session_id, registered_at) VALUES
(1, 1, '2026-08-01 10:15:00'),
(1, 3, '2026-08-02 09:00:00'),
(2, 2, '2026-08-03 14:30:00'),
(2, 4, '2026-08-04 08:45:00');

INSERT INTO equipments (name, quantity, status, image_url) VALUES
('Treadmill', 8, 'OK', '/images/treadmill.jpg'),
('Dumbbell Set', 20, 'OK', '/images/dumbbell.jpg'),
('Cable Machine', 4, 'REPAIRING', '/images/cable.jpg'),
('Rowing Machine', 3, 'BROKEN', '/images/rower.jpg'),
('Smith Machine', 2, 'OK', '/images/smith.jpg');
