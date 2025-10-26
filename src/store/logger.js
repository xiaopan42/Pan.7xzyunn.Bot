import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// 🎨 顏色定義
const COLORS = {
  admin: '#FF4747',     // 紅色（管理動作）
  system: '#00FF00',    // 綠色（系統事件）
  command: '#FFD700',   // 黃色（使用指令）
  error: '#FF0000',     // 紅色（錯誤事件）
  default: '#7289DA',   // Discord 藍
};

// 🏷️ Emoji 標籤
const EMOJIS = {
  admin: '🚨',
  system: '🟢',
  command: '💬',
  error: '❌',
  default: '📝',
};

/**
 * 🪵 發送日誌
 * @param {Client} client Discord 客戶端
 * @param {string} type 日誌類型（system/admin/command/error）
 * @param {string} title 標題
 * @param {Object|null} interaction Discord Interaction 或 null
 * @param {string|EmbedBuilder} details 詳細描述或 Embed
 * @param {string} color 自訂顏色（可選）
 */
export async function sendLog(client, type, title, interaction, details, color) {
  try {
    const channelId = process.env.MAIN_LOG_CHANNEL_ID;
    if (!channelId) {
      console.warn('⚠️ [Logger] 找不到 MAIN_LOG_CHANNEL_ID，請確認 .env 設定。');
      return;
    }

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      console.warn(`⚠️ [Logger] 無法找到日誌頻道 (${channelId})`);
      return;
    }

    // 🔍 使用者 / 伺服器 fallback
    const user =
      interaction?.user ||
      interaction?.author ||
      (client?.user
        ? { tag: client.user.tag, id: client.user.id }
        : { tag: '未知使用者', id: 'N/A' });

    const guild =
      interaction?.guild ||
      (client?.guilds?.cache?.size
        ? { name: '多伺服器運行中', id: '多個伺服器' }
        : { name: '未知伺服器', id: 'N/A' });

    // 🧱 準備 Embed
    let embed;
    if (details instanceof EmbedBuilder) {
      embed = details; // 允許直接傳入 embed
    } else {
      embed = new EmbedBuilder()
        .setTitle(`${EMOJIS[type] || EMOJIS.default} ${title}`)
        .setColor(color || COLORS[type] || COLORS.default)
        .setDescription(typeof details === 'string' ? details : '')
        .addFields(
          { name: '📋 類型', value: type, inline: true },
          { name: '👤 使用者', value: `${user.tag}\n(${user.id})`, inline: true },
          { name: '🏠 伺服器', value: `${guild.name}\n(${guild.id})`, inline: false },
        )
        .setTimestamp()
        .setFooter({ text: 'Pan.7xzyunn.Bot 日誌系統' });
    }

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ 發送日誌時發生錯誤:', err);
  }
}

/**
 * 🔺 管理員日誌
 */
export async function logAdmin(interaction, title, details) {
  await sendLog(interaction.client, 'admin', `管理操作：${title}`, interaction, details);
}

/**
 * 🟢 系統日誌
 */
export async function logSystem(client, title, details) {
  await sendLog(client, 'system', `系統事件：${title}`, null, details);
}

/**
 * 💬 指令使用日誌
 */
export async function logCommand(interaction, title, details) {
  await sendLog(interaction.client, 'command', `指令使用：${title}`, interaction, details);
}

/**
 * ❌ 錯誤日誌
 */
export async function logError(client, title, details) {
  await sendLog(client, 'error', `錯誤事件：${title}`, null, details);
}
