UPDATE `users` SET `role` = 'admin' WHERE `role` = 'staff';
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','member','trainer') NOT NULL DEFAULT 'user';
