import { SlashCommandBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '一般指令',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('測試機器人延遲'),

  async action(interaction) {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 延遲：${latency}ms`);

  },
};
