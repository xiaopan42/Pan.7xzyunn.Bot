import { SlashCommandBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '一般指令',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('讓機器人發送訊息')
    .addStringOption(opt =>
      opt.setName('message').setDescription('要發送的訊息').setRequired(true)
    ),

  async action(interaction) {
    const msg = interaction.options.getString('message');
    await interaction.reply({ content: '✅ 已發送訊息！', ephemeral: true });
    await interaction.channel.send(msg);

  },
};
