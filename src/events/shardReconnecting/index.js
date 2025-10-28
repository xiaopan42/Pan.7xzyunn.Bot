import { sendLog } from '../../store/logger.js';
import chalk from 'chalk';

export const event = {
  name: 'shardReconnecting',
  once: false,
  async execute(shardId) {
    console.log(chalk.yellow(`♻️ 機器人重新連線中（Shard ${shardId}）`));
    const { client } = await import('../../main.js');
    await sendLog(
      client,
      'reconnect',
      '機器人重新連線中',
      null,
      `Bot 正在嘗試重新連線 Discord。\nShard ID: ${shardId}`,
      '#FFD700'
    );
  },
};
