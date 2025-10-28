import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import pkg from '../../../package.json' assert { type: 'json' };

export const command = {
  category: '一般指令',
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('顯示機器人資訊'),

  async action(interaction) {
    const uptime = process.uptime(); // 以秒為單位
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const wsPing = interaction.client.ws.ping;
    const apiPing = Date.now() - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setTitle('🤖 機器人資訊')
      .setColor('#00BFFF')
      .addFields(
        { name: '🪪 名稱', value: interaction.client.user.tag, inline: true },
        { name: '🌐 版本', value: `v${pkg.version}`, inline: true },
        { name: '🏠 伺服器數量', value: `${interaction.client.guilds.cache.size}`, inline: true },
        {
          name: '🕒 上線時間',
          value: `${days}天 ${hours}小時 ${minutes}分 ${seconds}秒`,
          inline: true,
        },
        { name: '📡 API 延遲', value: `${apiPing}ms`, inline: true },
        { name: '⚙️ WebSocket 延遲', value: `${wsPing}ms`, inline: true }
      )
      .setFooter({ text: 'Pan.7xzyunn.Bot 系統資訊' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
