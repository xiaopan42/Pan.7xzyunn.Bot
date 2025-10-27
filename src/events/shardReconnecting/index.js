import { sendLog } from '../../store/logger.js';
import chalk from 'chalk';

export const event = {
  name: 'shardReconnecting',
  once: false,
  async execute(shardId) {
    console.log(chalk.yellow(`♻️ 機器人重新連線中（Shard ${shardId}）`));

    // 注意：client 是全域引入的，不是事件自帶參數
    const { client } = await import('../../main.js');

    await sendLog(
      client,
      'system',
      '♻️ 機器人重新連線',
      null,
      `Bot 正在嘗試重新連線 Discord。\nShard ID: ${shardId}`,
      'rgba(255, 216, 58, 1)' 
    );
  },
};
