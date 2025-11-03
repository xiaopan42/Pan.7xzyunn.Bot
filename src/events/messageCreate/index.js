import { maybeTranslateZhuyinInput } from '../../utils/zhuyinTranslator.js';

export const event = {
  name: 'messageCreate',
  async execute(message) {
    if (!message?.content || message.author?.bot) {
      return;
    }

    const { text: translatedText, translated } = await maybeTranslateZhuyinInput(message.content);

    if (!translated) {
      return;
    }

    await message.reply({
      content: `🈶 偵測到注音輸入，自動翻譯為：${translatedText}`,
      allowedMentions: { repliedUser: false },
    });
  },
};