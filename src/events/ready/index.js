import chalk from 'chalk';
import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(chalk.green(`✅ 機器人已登入：${client.user.tag}`));

    // 狀態列設定
    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: 'Pan.7xzyunn.Bot 0.1.0 by xiaopan.',
          type: 0,
        },
      ],
    });

    // 🟢 系統日誌
    await sendLog(
      client,
      'system',
      '機器人上線通知',
      null,
      `機器人帳號：${client.user.tag}\n時間：${new Date().toLocaleString('zh-TW')}`
    );
  },
};
