import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { logAdmin } from '../../store/logger.js'; // ✅ 改用新版 logger

export const command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('踢出指定成員')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('要踢出的成員')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('踢出原因')
        .setRequired(false)
    ),

  async action(interaction) {
    // ✅ 檢查權限
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令。', ephemeral: true });
    }

    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);

      await interaction.reply({ content: `✅ 已踢出成員 **${user.tag}**。\n理由：${reason}` });

      // ✅ 寫入管理日誌
      await logAdmin(
        interaction,
        '⚠️ 管理操作：踢出成員',
        `執行者：${interaction.user.tag} (${interaction.user.id})\n目標：${user.tag} (${user.id})\n原因：${reason}`
      );
    } catch (err) {
      console.error('踢出失敗:', err);
      await interaction.reply({ content: '❌ 無法踢出該成員，可能該成員權限較高或不存在。', ephemeral: true });
    }
  },
};
