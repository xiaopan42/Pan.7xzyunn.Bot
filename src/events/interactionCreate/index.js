import { commands } from '../../core/loader.js';

export const event = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const cmd = commands.find(c => c.data.name === interaction.commandName);
    if (!cmd) return;

    try {
      if (cmd.action) await cmd.action(interaction);
      else await interaction.reply({ content: '這個指令還沒有實作 action', ephemeral: true });
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        await interaction.reply({ content: '執行指令時發生錯誤', ephemeral: true });
      }
    }
  }
};
