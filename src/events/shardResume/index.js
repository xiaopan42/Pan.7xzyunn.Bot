import { sendLog } from '../../store/logger.js';
import chalk from 'chalk';

export const event = {
  name: 'shardResume',
  once: false,
  async execute(shardId) {
    console.log(chalk.green(`🟢 機器人重新連線成功（Shard ${shardId}）`));
    const { client } = await import('../../main.js');
    await sendLog(
      client,
      'system',
      '機器人重新連線成功',
      null,
      `Bot 已成功重新連線。\nShard ID: ${shardId}`,
      '#00FF00'
    );
  },
};
