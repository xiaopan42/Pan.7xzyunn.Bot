import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'shardResume',
  once: false,
  async execute(shardId, client) {
    console.log(`🟢 機器人重新連線成功（Shard ${shardId}）`);

    await sendLog(
      client,
      'system',
      '🟢 機器人重新連線成功',
      null,
      `Bot 已成功重新連線到 Discord Gateway（Shard ID: ${shardId}）。`,
      '#00FF00' // 綠色
    );
  },
};
