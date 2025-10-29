import chalk from 'chalk';

export const event = {
  name: 'shardResume',
  once: false,
  async execute(shardId) {
    console.log(chalk.green(`🟢 機器人重新連線成功（Shard ${shardId}）`));
  },
};
