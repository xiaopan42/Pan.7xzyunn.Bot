import { SlashCommandBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('機器人延遲'),
  async action(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply(`🏓 Pong! 機器人正常運行中 / 延遲: ${ping}ms`);
  },
};
