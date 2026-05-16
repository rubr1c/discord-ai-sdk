import { EmbedBuilder, type Guild } from 'discord.js';
import { BaseLogger } from './base-logger';
import type { LogLevel } from '../../types';

export class AuditLogger extends BaseLogger {
  private auditLogFn: (guild: Guild) => Promise<{ channelId?: string }>;
  private guild: Guild | null = null;

  constructor(level: LogLevel, auditLogFn: (guild: Guild) => Promise<{ channelId?: string }>) {
    super(level);
    this.auditLogFn = auditLogFn;
  }

  public setGuild(guild: Guild) {
    this.guild = guild;
  }

  public async getChannelId(): Promise<string | undefined> {
    if (!this.guild) {
      return undefined;
    }
    try {
      const result = await this.auditLogFn(this.guild);
      return result?.channelId;
    } catch (error) {
      console.error('Error getting audit channel ID:', error);
      return undefined;
    }
  }

  async debug(message: string, meta?: unknown): Promise<void> {
    if (!this.guild) {
      return;
    }
    try {
      const channelId = await this.getChannelId();
      if (channelId) {
        const channel = await this.guild.channels.fetch(channelId);

        const embed = this.buildEmbed('debug', message, meta);

        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error in audit debug logging:', error);
    }
  }

  async info(message: string, meta?: unknown): Promise<void> {
    if (!this.guild) {
      return;
    }

    try {
      const channelId = await this.getChannelId();
      if (channelId) {
        const channel = await this.guild.channels.fetch(channelId);

        const embed = this.buildEmbed('info', message, meta);

        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error in audit info logging:', error);
    }
  }
  async warn(message: string, meta?: unknown): Promise<void> {
    if (!this.guild) {
      return;
    }

    try {
      const channelId = await this.getChannelId();
      if (channelId) {
        const channel = await this.guild.channels.fetch(channelId);

        const embed = this.buildEmbed('warn', message, meta);

        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error in audit warn logging:', error);
    }
  }

  async error(message: string | Error, meta?: unknown): Promise<void> {
    if (!this.guild) {
      return;
    }

    try {
      const channelId = await this.getChannelId();
      if (channelId) {
        const channel = await this.guild.channels.fetch(channelId);

        const embed = this.buildEmbed(
          'error',
          message instanceof Error ? message.message : message,
          meta,
        );

        if (channel?.isTextBased()) {
          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Error in audit error logging:', error);
    }
  }

  private buildEmbed(level: LogLevel, message: string, meta?: unknown): EmbedBuilder {
    const colors: Record<LogLevel, number> = {
      debug: 0x808080,
      info: 0x0099ff,
      warn: 0xffa500,
      error: 0xff0000,
    };

    const embed = new EmbedBuilder()
      .setColor(colors[level])
      .setTitle(this.formatPrefix(level))
      .setDescription(message)
      .setTimestamp();

    if (meta !== undefined && meta !== null) {
      const metaString = this.formatMeta(meta);
      embed.addFields({ name: 'Meta', value: metaString });
    }

    return embed;
  }

  private formatMeta(meta: unknown): string {
    if (typeof meta === 'string') {
      return meta;
    }

    if (typeof meta === 'object' && meta !== null) {
      const obj = meta as Record<string, unknown>;
      const fields = Object.entries(obj)
        .map(([key, value]) => `**${key}:** ${value}`)
        .join('\n');
      return fields;
    }

    return String(meta);
  }
}
