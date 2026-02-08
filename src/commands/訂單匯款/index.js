import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { randomInt } from 'crypto';
import { createOrder } from '../../store/orders.js';

const BANK_ACCOUNT_CHOICES = [
  { name: '700 - 24410241344437', value: '700|24410241344437' },
];

function formatDateTime(date) {
  const pad = n => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function generateOrderNo() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let prefix = '';
  for (let i = 0; i < 3; i += 1) {
    prefix += letters[randomInt(0, letters.length)];
  }

  let digits = '';
  for (let i = 0; i < 9; i += 1) {
    digits += String(randomInt(0, 10));
  }

  return `${prefix}${digits}`;
}

export const command = {
  category: '商城指令',
  data: new SlashCommandBuilder()
    .setName('訂單匯款')
    .setDescription('建立一筆銀行轉帳訂單表格')
    .addStringOption(option =>
      option.setName('商品名稱').setDescription('訂單商品名稱').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('收款帳號')
        .setDescription('選擇收款帳號')
        .setRequired(true)
        .addChoices(...BANK_ACCOUNT_CHOICES)
    )
    .addUserOption(option =>
      option.setName('客人').setDescription('要標記的客人').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('付款金額').setDescription('付款金額（數字）').setRequired(true)
    ),

  async action(interaction) {
    const productName = interaction.options.getString('商品名稱', true);
    const orderNo = generateOrderNo();
    const bankSelection = interaction.options.getString('收款帳號', true);
    const [bankCode, bankAccount] = bankSelection.split('|');
    const customerUser = interaction.options.getUser('客人', true);
    const amount = interaction.options.getInteger('付款金額', true);

    const createdAt = formatDateTime(new Date());
    const createdAtIso = new Date().toISOString();

    try {
      await createOrder({
        orderNo,
        userId: customerUser.id,
        username: customerUser.username,
        productName,
        amount,
        bankCode,
        bankAccount,
        status: 'pending',
        createdAt: createdAtIso,
        createdBy: interaction.user.id,
      });
    } catch (err) {
      console.error('❌ 寫入訂單失敗:', err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ 訂單建立失敗')
            .setDescription('寫入訂單資料時發生錯誤，請稍後再試。'),
        ],
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#8EC8FF')
      .setTitle('<:check:1439939142145278012> 成功建立訂單（銀行轉帳）')
      .addFields(
        { name: '商品名稱', value: `\`\`\`${productName}\`\`\``, inline: false },
        { name: '訂單編號', value: `\`\`\`${orderNo}\`\`\``, inline: false },
        { name: '銀行代碼', value: `\`\`\`${bankCode}\`\`\``, inline: true },
        { name: '銀行帳號', value: `\`\`\`${bankAccount}\`\`\``, inline: true },
        { name: '客人', value: `\`\`\`${customerUser.username}\`\`\``, inline: false },
        { name: '付款金額', value: `\`\`\`${amount} 元\`\`\``, inline: false },
        { name: '建立時間', value: `\`\`\`${createdAt}\`\`\``, inline: false }
      )
      .setFooter({ text: `由 ${interaction.user.username} 建立 | PnY娛樂俱樂部` });

    await interaction.reply({ embeds: [embed] });
  },
};
