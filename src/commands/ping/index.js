import { SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('回覆 pong');

export const action = async (ctx) => {
  ctx.reply('pong');
}
