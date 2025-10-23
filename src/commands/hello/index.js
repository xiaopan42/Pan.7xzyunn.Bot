import { SlashCommandBuilder } from 'discord.js';

/**
 * 指令模板
 * 
 * 使用方式：
 * 1. 將資料夾名稱改成指令名稱，例如 "hello"
 * 2. 修改 command.data 的 name & description
 * 3. 修改 action 函式內的行為
 */

export const command = {
  data: new SlashCommandBuilder()
    .setName('hello')            // <- 改成你的指令名稱 (小寫)
    .setDescription('這是範例指令'), // <- 改成你的描述

  /**
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async action(interaction) {
    try {
      // 這裡寫你的指令邏輯
      await interaction.reply('這是一個範例回覆');

      // 例如可以加更多互動功能
      // await interaction.followUp('跟進訊息');
    } catch (err) {
      console.error(`執行 ${interaction.commandName} 指令時發生錯誤:`, err);

      if (!interaction.replied) {
        await interaction.reply({ content: '指令執行時發生錯誤', ephemeral: true });
      }
    }
  },
};
