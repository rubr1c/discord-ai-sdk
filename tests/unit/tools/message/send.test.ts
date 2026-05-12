import { describe, it, expect } from 'vitest';
import type { Guild } from 'discord.js';
import { sendMessageTool } from '@/tools/message/send';
import {
  createFakeGuild,
  createFakeNonTextChannel,
  createFakeTextChannel,
} from '../../../utils/discord';

describe('tools/message/send', () => {
  it('succeeds on text channel', async () => {
    const text = createFakeTextChannel({ id: '10', name: 'general' });
    const guild: Guild = createFakeGuild({ '10': text });

    const tool = sendMessageTool.tool({ guild }) as unknown as {
      execute: (args: { channelId: string; content: string }) => Promise<{
        summary: string;
        data?: { id: string; url: string; channelId: string };
      }>;
    };

    const res = await tool.execute({ channelId: '10', content: 'hello' });
    expect(res.summary).toContain('<#10>');
    expect(res.data?.id).toBe('m1');
    expect(res.data?.channelId).toBe('10');
  });

  it('returns not text-based summary for non-text channel', async () => {
    const nonText = createFakeNonTextChannel({ id: '20', name: 'voice' });
    const guild = createFakeGuild({ '20': nonText });

    const tool = sendMessageTool.tool({ guild }) as unknown as {
      execute: (args: { channelId: string; content: string }) => Promise<{ summary: string }>;
    };

    const res = await tool.execute({ channelId: '20', content: 'hello' });
    expect(res.summary).toContain('not text-based');
  });
});
