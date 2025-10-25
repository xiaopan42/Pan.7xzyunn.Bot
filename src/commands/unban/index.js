import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('解除封鎖指定成員')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('輸入使用者 ID（例如：123456789012345678）')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('解除封鎖原因')
        .setRequired(false)
    ),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '你沒有權限使用這個指令', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      await interaction.guild.bans.remove(userId, reason);
      await interaction.reply({ content: `已解除封鎖 <@${userId}>` });

      await sendLog(
        interaction.client,
        'admin',
        '🟢 管理操作：解除封鎖',
        `執行者：${interaction.user.tag}\n目標 ID：${userId}\n原因：${reason}`,
        interaction.guild
      );
    } catch (err) {
      console.error('解除封鎖失敗:', err);
      await interaction.reply({ content: '無法解除封鎖，請確認 ID 是否正確。', ephemeral: true });
    }
  },
};
