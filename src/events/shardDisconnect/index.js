import { sendLog } from '../../store/logger.js';
import chalk from 'chalk';

export const event = {
  name: 'shardDisconnect',
  once: false,
  async execute(event, shardId) {
    console.warn(chalk.red(`🔴 機器人斷線（Shard ${shardId}）`));
    const { client } = await import('../../main.js');
    await sendLog(
      client,
      'error',
      '機器人斷線',
      null,
      `Bot 已與 Discord 斷線。\nShard ID: ${shardId}`,
      '#FF4747'
    );
  },
};
