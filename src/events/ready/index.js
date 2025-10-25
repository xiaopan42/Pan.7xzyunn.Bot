import { Events } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ 機器人已登入：${client.user.tag}`);

    // 🟢 傳送上線日誌（綠色）
    await sendLog(
      client,
      'system',
      '🟢 機器人上線',
      `Bot 已登入為 **${client.user.tag}**，目前在 ${client.guilds.cache.size} 個伺服器中運行。`,
      null,
      '#00FF00' // 🟢 綠色
    );

    // 設定狀態欄
    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: 'Pan.7xzyunn.Bot 0.1.0 by xiaopan.',
          type: 0, // 0 = Playing
        },
      ],
    });
  },
};
