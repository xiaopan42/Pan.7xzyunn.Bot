import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '管理指令',
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('解除封鎖指定成員')
    .addStringOption(o => o.setName('userid').setDescription('要解除封鎖的使用者 ID').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('解除封鎖原因'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers))
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply(`已解除封鎖使用者 ID.${userId}`);

    } catch (err) {
      await interaction.reply({ content: '❌ 無法解除封鎖該使用者', ephemeral: true });
      await sendLog(
        interaction.client,
        'error',
        '指令錯誤',
        interaction,
        `執行 **/${interaction.commandName}** 時發生錯誤：${err.message}`
      );
    }
  },
};
