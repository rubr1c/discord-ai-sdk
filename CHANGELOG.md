# Changelog

All notable changes to this project will be documented in this file.

## [v0.2.0] - 2026-05-12

### Added

- **Thread Management Tools**
  - Create, fetch, lock/unlock, and manage Discord threads.
- **Voice Channel Management Tools**
  - Control voice channel settings, user limits, and bitrates.
- **Message Reaction Tools**
  - Add, remove, and manage reactions on messages.
- **Server Ban Tools**
  - Fetch server bans, ban users, and unban users.

### Updates

- Bumped core Vercel AI SDK (`ai` to v6) and `@ai-sdk/google` (v3).
- Bumped `discord.js` to `v14.26.4`.
- Updated dev tooling: `typescript` (v6.0.3), `vitest` (v4.1.6), and `eslint` (v10.3.0).
- Fixed path resolution configurations in `tsconfig.json` and `vitest.config.ts`.

## [v0.1.1] – 2025-09-25

### Patches

- Added try-catch error handling to various tools that were missing it
  - Category tools: create, fetch
  - Channel tools: fetch, move, permission, rename
  - Member tools: fetch, timeout, untimeout
  - Message tools: get, pin
  - Role tools: assign, create, id, remove
  - Server tools: audit-logs, emojis, stickers

## [v0.1.0] G�� 2025-09-23

### Added

#### User-Facing Features

- **Audit Logs Tool** (`getAuditLogsTool`)
  - Fetch audit logs from Discord servers with type validation
  - Supports `limit` (1G��100), pagination (`before`, `after`)
  - Returns structured data (executor, target, changes)

- **Channel Permissions Management** (`manageChannelPermissionsTool`)
  - Manage channel permission overwrites for roles/users
  - `createChannelTool` updated to support permission overwrites

#### Developer-Facing Features

- **Logging System Overhaul**
  - New `AuditLogger` with interval-based flushing
  - Added `CompositeLogger` for multi-logger aggregation
  - Standardized timestamp formatting across all loggers
  - Centralized logging utilities under `utils/logger/`

- **Constructor Options Pattern**
  - All major classes now use options objects (`{ ... }`) instead of positional args
  - Applied to `PromptBuilder`, `AuditLogger`, `ConsoleLogger`, `CompositeLogger`
  - Improved type safety, defaults, and maintainability

---

### Changed

#### User-Facing

- **Permission Handling**
  - Replaced `PermissionSchema` G�� `permissionSchema` & `permissionOverwriteSchema`
  - Better consistency and alignment with DiscordG��s `PermissionsBitField`

#### Developer-Facing

- **Imports**
  - Migrated to alias-based imports (`@/tools/...`, `@/core/...`)
  - Improves readability and maintainability

- **Code Cleanup**
  - Removed redundant optional calls and unused imports
  - Improved code readability and structure

---

### Technical Details

#### Logging System

- Introduced `BaseLogger` for shared timestamp formatting
- `CompositeLogger` supports logging to multiple outputs
- `AuditLogger` supports interval-based flushing
- Updated `AIEngine`, `DiscordRouter`, `PromptBuilder`, `RateLimiter`, `ToolRegistry` to use new loggers

#### Permission System

- Stronger type safety with Zod schemas
- Updated `createChannelTool`, `manageChannelPermissionsTool`, `createRoleTool`, `updateRoleTool`

#### Constructor API

- All constructors now use `options` pattern
- Default params handled consistently
- Reduced parameter-ordering issues

#### Audit Logs

- Full audit log event type support with validation
- Error handling and type-safe structured results
