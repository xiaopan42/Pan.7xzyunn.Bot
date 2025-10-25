import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'shardDisconnect',
  once: false,
  async execute(event, shardId, client) {
    console.warn(`⚠️ 機器人斷線（Shard ${shardId}）`);

    await sendLog(
      client,
      'system',
      '🔴 機器人離線',
      `Bot 已與 Discord 斷線（Shard ID: ${shardId}）。`
    );
  },
};
