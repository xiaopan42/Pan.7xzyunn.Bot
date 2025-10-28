import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logCommand } from '../../store/logger.js'; // ✅ 新增日誌模組

export const command = {
  category: '一般指令',
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('取得邀請連結，將機器人加入伺服器'),

  async action(interaction) {
    try {
      const clientId = interaction.client.user.id;
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

      const embed = new EmbedBuilder()
        .setTitle('🤖 邀請 Pan.7xzyunn.Bot')
        .setDescription(`[點我邀請機器人到你的伺服器！](${inviteUrl})`)
        .setColor('#ABB2FF') // ✅ 正確色碼
        .setFooter({ text: 'Pan.7xzyunn.Bot 0.1.0 by xiaopan.' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

      // ✅ 記錄日誌
      await logCommand(
        interaction,
        '使用 /invite 指令',
        `使用者：${interaction.user.tag} (${interaction.user.id}) 取得邀請連結`
      );
    } catch (err) {
      console.error('執行 invite 指令發生錯誤:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 無法生成邀請連結。', ephemeral: true });
      }
    }
  },
};
