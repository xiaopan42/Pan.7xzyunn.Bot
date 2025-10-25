import { SlashCommandBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('讓機器人說話')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('要讓機器人說的內容')
        .setRequired(true)
    ),

  async action(interaction) {
    const text = interaction.options.getString('message');

    try {
      await interaction.deferReply({ flags: 64 });

      await interaction.channel.send(text);

      await interaction.editReply({ content: '📄 訊息發送成功' });
    } catch (err) {
      console.error('執行 say 指令發生錯誤:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 指令執行時發生錯誤。', flags: 64 });
      }
    }
  },
};
