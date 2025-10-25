import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'shardReconnecting',
  once: false,
  async execute(shardId, client) {
    console.log(`♻️ 機器人重新連線中（Shard ${shardId}）`);

    await sendLog(
      client,
      'system',
      '♻️ 機器人重新連線',
      `Bot 正在嘗試重新連線 Discord（Shard ID: ${shardId}）。`
    );
  },
};
