import { logAdmin } from './logger.js';
import { EmbedBuilder } from 'discord.js';

/**
 * 統一管理員操作日誌輸出
 * @param {CommandInteraction} interaction Discord 互動物件
 * @param {string} actionTitle 動作標題 (例如 "封鎖使用者" / "踢出使用者")
 * @param {object} target 目標成員 (User 或 GuildMember)
 * @param {string} reason 原因（可選）
 */
export async function logAdminAction(interaction, actionTitle, target, reason = '未提供原因') {
  const user = target?.user || target;

  const details = [
    `👮 管理員：${interaction.user.tag} (${interaction.user.id})`,
    `🎯 目標：${user?.tag || '未知'} (${user?.id || 'N/A'})`,
    `📝 理由：${reason}`,
  ].join('\n');

  await logAdmin(interaction, actionTitle, details);
}
