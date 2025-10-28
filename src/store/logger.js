import { EmbedBuilder } from 'discord.js';
import chalk from 'chalk';
import dotenv from 'dotenv';
dotenv.config();

const COLORS = {
  admin: '#FF4747',
  system: '#00FF00',
  command: '#FFD700',
  error: '#FF0000',
  reconnect: '#FFA500',
  default: '#7289DA',
};

const EMOJIS = {
  admin: '🚨',
  system: '💻',
  command: '💬',
  error: '❌',
  reconnect: '♻️',
  default: '📝',
};

export async function sendLog(client, type, title, interaction, details, color) {
  try {
    const channelId = process.env.MAIN_LOG_CHANNEL_ID;
    if (!channelId) {
      console.warn('⚠️ [Logger] 缺少 MAIN_LOG_CHANNEL_ID');
      return;
    }

    // ✅ 檢查 client 狀態
    if (!client?.token || !client?.channels) {
      console.warn(chalk.yellow(`⚠️ [Logger] Client 尚未登入，略過日誌：${title}`));

      // 彩色 fallback 日誌
      let colorFn = chalk.white;
      if (type === 'system') colorFn = chalk.cyan;
      else if (type === 'reconnect') colorFn = chalk.yellow;
      else if (type === 'error') colorFn = chalk.red;
      else if (type === 'admin') colorFn = chalk.magenta;

      console.log(colorFn(`📋 [Fallback 日誌] ${new Date().toLocaleString('zh-TW')} | ${title}`));
      if (typeof details === 'string') console.log(colorFn(details));
      return;
    }

    // ✅ 有 client 時繼續執行
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      console.warn(`⚠️ 找不到日誌頻道：${channelId}`);
      return;
    }

    const user = interaction?.user || interaction?.author || client?.user || { tag: '未知使用者', id: 'N/A' };
    const guild = interaction?.guild || { name: '未知伺服器', id: 'N/A' };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS[type] || EMOJIS.default} ${title}`)
      .setColor(color || COLORS[type] || COLORS.default)
      .setTimestamp()
      .setFooter({ text: 'Pan.7xzyunn.Bot 日誌系統' });

    if (details && typeof details === 'string' && details.trim()) embed.setDescription(details);

    embed.addFields(
      { name: '📋 類型', value: type, inline: true },
      { name: '👤 使用者', value: `${user.tag}\n(${user.id})`, inline: true },
      { name: '🏠 伺服器', value: `${guild.name}\n(${guild.id})`, inline: false },
    );

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ 發送日誌時發生錯誤:', err);
  }
}
