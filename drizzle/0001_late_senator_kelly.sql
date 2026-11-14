CREATE TABLE `gg_admin_auth_rate_limits` (
	`bucket` varchar(80) NOT NULL,
	`window_started_at` timestamp NOT NULL,
	`request_count` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gg_admin_auth_rate_limits_bucket` PRIMARY KEY(`bucket`)
);
--> statement-breakpoint
CREATE TABLE `gg_admin_login_challenges` (
	`id` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`code_hash` varchar(64) NOT NULL,
	`attempt_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`consumed_at` timestamp,
	CONSTRAINT `gg_admin_login_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gg_admin_sessions` (
	`token_hash` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	CONSTRAINT `gg_admin_sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `gg_site_content` (
	`section` varchar(24) NOT NULL,
	`payload` longtext NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gg_site_content_section` PRIMARY KEY(`section`)
);
