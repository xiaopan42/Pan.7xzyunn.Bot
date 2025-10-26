import chalk from 'chalk';
import { EmbedBuilder } from 'discord.js';
import { startWeb } from '../../web/server.js';
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

    // 🟢 使用 sendLog 統一發送（不再重複手動送 embed）
    await sendLog(
      client,
      'system',
      '🟢 機器人上線',
      null,
      `機器人帳號：${client.user.tag}\n時間：${new Date().toLocaleString('zh-TW')}`
    );

    console.log(chalk.blue('🌐 正在啟動控制面板...'));
    startWeb(client);
    console.log(chalk.cyan('💡 控制面板運作中，請至 http://localhost:3000 查看。'));
  },
};
