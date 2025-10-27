import { sendLog } from '../../store/logger.js';
import chalk from 'chalk';

export const event = {
  name: 'shardDisconnect',
  once: false,
  async execute(event, shardId) {
    console.warn(chalk.red(`⚠️ 機器人斷線（Shard ${shardId}）`));

    // 匯入全域 client（從 main.js）
    const { client } = await import('../../main.js');

    await sendLog(
      client,
      'system',
      '🔴 機器人離線',
      null,
      `Bot 已與 Discord 斷線。\nShard ID: ${shardId}\n代碼：${event?.code || '未知'}`
    );
  },
};
