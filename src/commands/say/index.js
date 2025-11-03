import { SlashCommandBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';
import { maybeTranslateZhuyinInput } from '../../utils/zhuyinTranslator.js';

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
    const { text: resolvedMessage, translated } = await maybeTranslateZhuyinInput(msg);

    const replyText = translated
      ? `✅ 已發送訊息！（已自動轉換：${resolvedMessage}）`
      : '✅ 已發送訊息！';

    await interaction.reply({ content: replyText, ephemeral: true });
    await interaction.channel.send(resolvedMessage);
  },
};
