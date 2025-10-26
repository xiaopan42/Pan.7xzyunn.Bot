import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { logCommand } from '../../store/logger.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('讓機器人說出指定內容')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('要讓機器人說的內容')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // ✅ 限管理員使用

  async action(interaction) {
    const text = interaction.options.getString('message');

    try {
      // ✅ 使用 deferReply 但不顯示警告（flags → ephemeral）
      await interaction.deferReply({ ephemeral: true });

      // ✅ 發送訊息到同一個頻道
      await interaction.channel.send(text);

      // ✅ 告知成功
      await interaction.editReply('✅ 已成功發送訊息！');

      // ✅ 寫入日誌
      await logCommand(
        interaction,
        '使用 /say 指令',
        `使用者：${interaction.user.tag} (${interaction.user.id})\n內容：${text}`
      );
    } catch (err) {
      console.error('執行 say 指令發生錯誤:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 發送訊息時發生錯誤。', ephemeral: true });
      }
    }
  },
};
