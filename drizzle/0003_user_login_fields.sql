ALTER TABLE `users` MODIFY COLUMN `openId` varchar(320) NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `password` varchar(255) NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `memberId` int NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `avatar` varchar(16) NULL;
