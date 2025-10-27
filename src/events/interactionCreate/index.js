import { commands } from '../../core/loader.js';
import { sendLog } from '../../store/logger.js';

export const event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const cmd = commands.find(c => c.data.name === interaction.commandName);
    if (!cmd) return;

    // 🧩 紀錄指令日誌
    await sendLog(
      interaction.client,
      'command',
      '指令使用記錄',
      `使用者：${interaction.user.tag}\n指令：/${interaction.commandName}`,
      interaction.guild
    );

    try {
      if (cmd.action) await cmd.action(interaction);
      else await interaction.reply({ content: '這個指令還沒有實作 action', flags: 64 });
    } catch (err) {
      console.error(err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '執行指令時發生錯誤', flags: 64 });
      }

      await sendLog(
        interaction.client,
        'system',
        '❌ 指令執行錯誤',
        `伺服器：${interaction.guild?.name || '未知'}\n指令：/${interaction.commandName}\n錯誤：${err.message}`,
        interaction.guild
      );
    }
  },
};
