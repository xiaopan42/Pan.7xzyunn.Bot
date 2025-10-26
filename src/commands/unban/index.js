import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { logAdmin } from '../../store/logger.js';

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
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令。', ephemeral: true });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || '未提供原因';

    // ✅ 檢查 ID 是否為合法 snowflake
    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({ content: '❌ 無效的使用者 ID，請確認格式正確（例：123456789012345678）。', ephemeral: true });
    }

    try {
      await interaction.guild.bans.remove(userId, reason);

      const embed = new EmbedBuilder()
        .setTitle('🟢 成功解除封鎖')
        .setDescription(`<@${userId}> 已解除封鎖。\n理由：${reason}`)
        .setColor('#57F287')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // ✅ 寫入管理日誌
      await logAdmin(
        interaction,
        '🟢 管理操作：解除封鎖',
        `執行者：${interaction.user.tag} (${interaction.user.id})\n目標 ID：${userId}\n原因：${reason}`
      );

    } catch (err) {
      console.error('解除封鎖失敗:', err);

      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ 解除封鎖失敗')
        .setDescription('無法解除封鎖，請確認使用者 ID 是否正確或該用戶是否被封鎖。')
        .setColor('#ED4245');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
