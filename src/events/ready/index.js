import chalk from 'chalk';
import { sendLog } from '../../store/logger.js';
import pkg from '../../../package.json' assert { type: 'json' };

export const event = {
  name: 'ready',
  once: true,
  async execute(client) {

    // 狀態列設定
    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: `/help | v${pkg.version} by xiaopan.`,
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
