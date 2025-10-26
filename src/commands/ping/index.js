import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logCommand } from '../../store/logger.js'; // ✅ 若有 command log

export const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('查看機器人延遲狀態'),

  async action(interaction) {
    const ping = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`機器人運行正常 ✅\n目前延遲：\`${ping}ms\``)
      .setColor('#57F287') // ✅ Discord 綠
      .setFooter({ text: 'Pan.7xzyunn.Bot 0.1.0 by xiaopan.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // ✅ 日誌系統記錄（可選）
    await logCommand(
      interaction,
      '使用 /ping 指令',
      `使用者：${interaction.user.tag} (${interaction.user.id})`
    );
  },
};
