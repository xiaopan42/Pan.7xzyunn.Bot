import { SlashCommandBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('讓機器人說話')
    .addStringOption(option =>
      option.setName('message').setDescription('機器人要說的內容').setRequired(true)
    ),

  async action(interaction) {
    const text = interaction.options.getString('message');

    try {
      await interaction.reply({ content: `📄 訊息發送成功 : ${text}`, ephemeral: true });
      await interaction.channel.send(text);
    } catch (err) {
      console.error(`執行 say 指令發生錯誤:`, err);
      if (!interaction.replied) {
        await interaction.reply({ content: '指令執行時發生錯誤', ephemeral: true });
      }
    }
  },
};
