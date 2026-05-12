import {
  Events,
  Guild,
  Message,
  PermissionsBitField,
  SlashCommandBuilder,
  type Client,
  type Interaction,
} from 'discord.js';
import { type BotMode, type Logger, type RequestContext } from '@/core/types';
import { AIError } from '@/core/error';
import { AIEngine } from '@/core/ai-engine';
import { splitMessage } from '@/core/utils/message';
import type { CompositeLogger } from '@/core/utils/logger/composite-logger';

/**
 * Configuration for the Discord router.
 */
export interface DiscordRouterProps {
  /** The mode of the router. */
  mode: BotMode;

  /** The engine of the router. */
  engine: AIEngine;

  /** The activator of the router. */
  activator: string;

  /** The required role function of the router. */
  requiredRoleFn?: (guild: Guild) => Promise<string>;

  /** The allowed channels function of the router. */
  allowedChannelsFn?: (guild: Guild) => Promise<string[]>;

  /** The ephemeral replies of the router. @default false */
  ephemeralReplies?: boolean;

  /** The logger of the router. @default new ConsoleLogger() */
  logger?: Logger | CompositeLogger;
}

export class DiscordRouter {
  private readonly mode: BotMode;
  private readonly activator: string;
  private requiredRoleFn: ((guild: Guild) => Promise<string>) | undefined;
  private allowedChannelsFn: ((guild: Guild) => Promise<string[]>) | undefined;
  private ephemeralReplies: boolean;
  public engine: AIEngine;
  public logger: Logger | CompositeLogger;

  /**
   * Creates a Discord router.
   * @param options - The options for the Discord router.
   * @example
   * const discordRouter = new DiscordRouter({
   *   mode: 'message',
   *   engine: new AIEngine({ model: openai('gpt-4o'), logger: new ConsoleLogger() }),
   *   activator: '!ai',
   *   logger: new ConsoleLogger(),
   * });
   */
  constructor({
    mode,
    engine,
    activator,
    requiredRoleFn,
    allowedChannelsFn,
    ephemeralReplies,
    logger,
  }: DiscordRouterProps) {
    this.mode = mode;
    this.activator = activator;
    this.requiredRoleFn = requiredRoleFn;
    this.allowedChannelsFn = allowedChannelsFn;
    this.ephemeralReplies = ephemeralReplies ?? false;
    this.engine = engine;
    this.logger = logger ?? engine.logger;
  }

  /**
   * Subscribes to the Discord client.
   * @param client - The Discord client.
   */
  public subscribe(client: Client): void {
    this.logger.info({
      message: 'DiscordRouter.subscribe',
      meta: { mode: this.mode, activator: this.activator },
    });
    switch (this.mode) {
      case 'message':
        client.on(Events.MessageCreate, async (message: Message) => {
          if (!message.content.startsWith(this.activator)) return;
          let ctx: RequestContext | undefined;
          try {
            ctx = this.buildContext(message);
            if (!ctx.channel.isTextBased()) {
              return;
            }

            ctx.channel.sendTyping();
            const response = await this.dispatch(ctx);
            await this.sendMessageResponse(message, response);
          } catch (error) {
            this.logger.error({
              message: 'Error handling message:',
              error: error as Error,
              ...(ctx && { guild: ctx.guild }),
            });
            if (error instanceof AIError) {
              await message.reply(`Error: ${error.message}`);
            } else {
              await message.reply('Sorry, I encountered an error while processing your request.');
            }
          }
        });
        break;
      case 'slash':
        this.setupSlashCommands(client);
        break;
    }
  }

  /**
   * Builds the context for the event.
   * @param event - The event to build the context for.
   * @returns The context for the event.
   */
  private buildContext(event: Message | Interaction): RequestContext {
    if (!event.guild) throw new Error('No Guild');
    if (!event.channel || !event.channel.isTextBased())
      throw new Error('Channel is not text-based');

    const channel = event.channel;
    if (!('guild' in channel) || !channel.guild) {
      throw new Error('Channel is not guild-based');
    }

    if ('author' in event && 'content' in event) {
      const message = event;
      return {
        guild: channel.guild,
        channel: channel,
        userId: message.author.id,
        content: message.content.replace(this.activator, '').trim(),
        member: message.member,
      };
    } else if ('user' in event) {
      const interaction = event;
      const prompt = interaction.isChatInputCommand()
        ? interaction.options.getString('prompt') || ''
        : '';

      return {
        guild: channel.guild,
        channel: channel,
        userId: interaction.user.id,
        content: prompt,
        member: interaction.member,
      };
    } else {
      throw new Error('Unknown event type');
    }
  }

  /**
   * Dispatches the request to the engine.
   * @param ctx - The context for the request.
   * @returns The response from the engine.
   */
  private async dispatch(ctx: RequestContext): Promise<string> {
    this.logger.debug({
      message: 'DiscordRouter.dispatch',
      meta: { userId: ctx.userId, guildId: ctx.guild.id },
      guild: ctx.guild,
    });

    if (!(await this.hasPermission(ctx))) {
      throw new AIError('NO_PERMISSION', `User[${ctx.userId}] has no permission`);
    }

    if (!(await this.inAllowedChannel(ctx))) {
      throw new AIError('NO_PERMISSION', `Channel[${ctx.channel.id}] is not allowed to use this`);
    }

    try {
      const response = await this.engine.handle(ctx.content, ctx);
      return response;
    } catch (err) {
      this.logger.error({
        message: 'DiscordRouter.dispatch error',
        error: err as Error,
        guild: ctx.guild,
      });
      if (err instanceof AIError) {
        return `Error: ${err.message}`;
      } else {
        return 'Error: Something went wrong with the AI engine.';
      }
    }
  }

  /**
   * Checks if the channel is allowed.
   * @param ctx - The context for the request.
   * @returns True if the channel is allowed, false otherwise.
   */
  private async inAllowedChannel(ctx: RequestContext): Promise<boolean> {
    if (!this.allowedChannelsFn) return true;
    return (await this.allowedChannelsFn(ctx.guild)).includes(ctx.channel.id);
  }

  /**
   * Checks if the user has permission.
   * @param ctx - The context for the request.
   * @returns True if the user has permission, false otherwise.
   */
  private async hasPermission(ctx: RequestContext): Promise<boolean> {
    if (!ctx.member) return false;

    if (this.requiredRoleFn) {
      const role = await this.requiredRoleFn(ctx.guild);

      if (
        'roles' in ctx.member &&
        typeof ctx.member.roles === 'object' &&
        'cache' in ctx.member.roles
      ) {
        return ctx.member.roles.cache.has(role);
      } else if ('roles' in ctx.member && Array.isArray(ctx.member.roles)) {
        return ctx.member.roles.includes(role);
      }
      return false;
    } else {
      if (
        'permissions' in ctx.member &&
        typeof ctx.member.permissions === 'object' &&
        'has' in ctx.member.permissions
      ) {
        return ctx.member.permissions.has(PermissionsBitField.Flags.Administrator);
      }
      return false;
    }
  }

  /**
   * Sends the response to the message.
   * @param message - The message to send the response to.
   * @param response - The response to send.
   */
  private async sendMessageResponse(message: Message, response: string): Promise<void> {
    const chunks = splitMessage(response);

    if (chunks.length > 0 && chunks[0]) {
      await message.reply(chunks[0]);

      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk && 'send' in message.channel) {
          await message.channel.send(chunk);
        }
      }
    }
  }

  /**
   * Sends the response to the interaction.
   * @param interaction - The interaction to send the response to.
   * @param response - The response to send.
   */
  private async sendInteractionResponse(interaction: Interaction, response: string): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const chunks = splitMessage(response);

    if (chunks.length > 0 && chunks[0]) {
      if (interaction.deferred) {
        await interaction.editReply(chunks[0]);
      } else {
        await interaction.reply({
          content: chunks[0],
          ephemeral: this.ephemeralReplies,
        });
      }

      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk) {
          await interaction.followUp({
            content: chunk,
            ephemeral: this.ephemeralReplies,
          });
        }
      }
    } else {
      const fallback = "I received your request but couldn't generate a proper response.";
      if (interaction.deferred) {
        await interaction.editReply(fallback);
      } else {
        await interaction.reply({
          content: fallback,
          ephemeral: this.ephemeralReplies,
        });
      }
    }
  }

  /**
   * Sets up the slash commands.
   * @param client - The Discord client.
   */
  private setupSlashCommands(client: Client): void {
    const cmd = new SlashCommandBuilder()
      .setName(this.activator)
      .setDescription('AI can help you with stuff in the server')
      .addStringOption((option) =>
        option
          .setName('prompt')
          .setDescription('What you want the AI to help with')
          .setRequired(true),
      );

    client.once(Events.ClientReady, async () => {
      try {
        await client.application?.commands.create(cmd);
        this.logger.info({ message: 'Slash command created' });
      } catch (error) {
        this.logger.error({ message: 'Failed to register slash command:', error: error as Error });
      }
    });

    client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== this.activator) return;

      try {
        const ctx = this.buildContext(interaction);

        if (!ctx.channel.isTextBased()) {
          return;
        }

        ctx.channel.sendTyping();

        await interaction.deferReply({ ephemeral: this.ephemeralReplies });

        const response = await this.dispatch(ctx);
        await this.sendInteractionResponse(interaction, response);
      } catch (error) {
        this.logger.error({ message: 'Error handling slash command:', error: error as Error });
        const errorMsg =
          error instanceof AIError
            ? `Error: ${error.message}`
            : 'Sorry, I encountered an error while processing your request. Please try again.';

        try {
          if (interaction.deferred) {
            await interaction.editReply(errorMsg);
          } else {
            await interaction.reply({
              content: errorMsg,
              ephemeral: this.ephemeralReplies,
            });
          }
        } catch (replyError) {
          this.logger.error({
            message: 'Failed to send error response:',
            error: replyError as Error,
          });
        }
      }
    });
  }
}
