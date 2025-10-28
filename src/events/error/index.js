import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'error',
  once: false,
  async execute(error, client) {
    console.error('❌ Bot 遇到錯誤:', error);

    await sendLog(
      client,
      'system',
      '❌ 未捕捉的錯誤',
      null,
      `錯誤訊息：\`\`\`${error.message || error}\`\`\``
    );
  },
};
