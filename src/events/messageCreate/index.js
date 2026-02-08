export const event = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    // 忽略機器人訊息
    if (message.author.bot) return;

    // 特定訊息回覆
    if (message.content === '! 轉帳') {
      await message.reply('# ! PnY娛樂俱樂部ᓍ\n## 轉帳帳號\n## 700 - 24410241344437\n## 轉帳完請截圖 轉發給客服\n## 只要開始打就不接受退款');
    }
    if (message.content === '! 無卡') {
      await message.reply('# ! PnY娛樂俱樂部ᓍ\n## 無卡目前暫未開放\n## 如需要目前只提供郵局無卡\n## 無卡帳號\n## 700 - 24410241344437\n## 無卡完請拍明細 傳給客服\n## 只要開始打就不接受退款');
    }
  },
};
