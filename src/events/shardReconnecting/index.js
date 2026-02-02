import chalk from 'chalk';

export const event = {
  name: 'shardReconnecting',
  once: false,
  async execute(shardId) {
    console.log(chalk.yellow(`♻️ 機器人重新連線中（Shard ${shardId}）`));
  },
};
