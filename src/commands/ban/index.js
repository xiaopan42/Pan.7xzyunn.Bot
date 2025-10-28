import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '管理指令',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('封鎖指定成員')
    .addUserOption(option =>
      option.setName('target').setDescription('要封鎖的成員').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('封鎖原因').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });
    }

    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.ban({ reason });
      await interaction.reply({ content: `已封鎖成員 **${user.tag}** / 理由：${reason}` });

      // ✅ 新版日誌
      await sendLog(
        interaction.client,
        'command',
        '使用指令',
        interaction,
        `使用者執行了 **/${interaction.commandName}**\n封鎖目標：${user.tag}\n原因：${reason}`
      );
    } catch (err) {
      console.error('封鎖失敗:', err);
      await interaction.reply({ content: '❌ 無法封鎖該成員', ephemeral: true });

      await sendLog(
        interaction.client,
        'error',
        '指令錯誤',
        interaction,
        `嘗試執行 **/${interaction.commandName}** 時發生錯誤。\n錯誤訊息：${err.message}`
      );
    }
  },
};
