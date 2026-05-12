# Tools Overview

## Structure

- **Zod input**: Each tool defines an `inputSchema` with `zod` for safe, typed inputs.
- **Standardized result**: Tools return `{ summary: string, data?: unknown }` (`ToolResult<T>`), summarized for end users.
- **Binding**: Each exported tool is a `ToolFactory` with shape `{ tool: ({ guild, logger }) => aiTool, safetyLevel }`. The engine supplies `{ guild, logger }` when executing.
- **Safety level**: Registered with a safety level (`low`, `mid`, `high`) to allow filtering.

## Built-in tool groups

The built-in `discordApiTools` are grouped by domain so you can opt-in to only what you need:

- `channelTools`: create, fetch, delete, rename, move
- `categoryTools`: create, fetch, delete
- `roleTools`: create, fetch, update, assign/remove, delete, resolve role ID
- `memberTools`: fetch, resolve user ID, kick, ban/unban, timeout/untimeout
- `messageTools`: send, fetch, delete, pin/unpin
- `threadTools`: create, fetch, archive, delete
- `reactionTools`: get reactions, add/remove reaction
- `vcTools`: move, mute, deafen, disconnect voice members
- `serverTools`: server info, set server name, list emojis/stickers, audit logs

You can mix and match:

```ts
import { ToolRegistry, discordApiTools } from 'discord-ai-sdk';

const tools = new ToolRegistry({
  tools: {
    ...discordApiTools.channelTools,
    getMessages: discordApiTools.messageTools.getMessages,
    sendMessage: discordApiTools.messageTools.sendMessage,
  },
});
```

## Representative examples

### sendMessage (messages)

Input and behavior:

```ts
// input
{
  channelId: string;           // id of channel
  content: string;             // 1..2000 characters
}

// result shape (success)
{ summary: `Sent message to <#channelId>`, data: { id: string, url: string, channelId: string } }
```

Duplicate removed.

### manageChannelPermissions (channels)

```ts
// input (simplified)
{
  channelId: string;
  overwrites: Array<{
    id: string; // role or user id
    allow?: string[]; // permission names
    deny?: string[];
  }>;
}

// result
{
  summary: `Updated permission overwrites for channelId`;
}
```

### updateRole (roles)

```ts
// input (simplified)
{
  roleId: string;
  name?: string;
  color?: string | null; // hex like "ff0000"
  mentionable?: boolean;
  permissions?: {
    administrator?: boolean;
    // ... granular flags
  };
}

// result
{ summary: `Updated role roleId` }
```

### addReaction (reactions)

```ts
// input
{
  channelId: string;
  messageId: string;
  emoji: string; // discord emoji format :name:
}

// result
{
  summary: `Added reaction to message ${messageId}`;
}
```

### vc: moveMember (voice)

```ts
// input
{
  userId: string;
  toChannelId: string;
}

// result
{
  summary: `Moved userId to toChannelId`;
}
```

### server: getAuditLogs

```ts
// input
{
  types?: number[]; // Discord audit log action types
  limit?: number;   // 1..100
}

// result
{ summary: `Fetched N audit log entries`, data: { entries: [...] } }
```

All tools follow the same schema/execute pattern; destructive tools are marked with higher safety levels.
