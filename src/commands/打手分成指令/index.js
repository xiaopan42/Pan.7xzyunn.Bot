import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';
import { adjustBalance } from '../../store/bank.js';

export const command = {
  category: '銀行指令',

  data: new SlashCommandBuilder()
    .setName('commission')
    .setDescription('管理員專用：計算訂單分錢，並發放打手實領（會寫入餘額）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addNumberOption(option =>
      option
        .setName('amount')
        .setDescription('訂單總金額（例如 600）')
        .setRequired(true))
    .addNumberOption(option =>
      option
        .setName('clubrate')
        .setDescription('俱樂部抽成百分比（例如 20）')
        .setRequired(true))
    .addUserOption(option =>
      option
        .setName('worker')
        .setDescription('打手1（必填）')
        .setRequired(true))
    .addUserOption(option =>
      option
        .setName('worker2')
        .setDescription('打手2（選填，若填則平分）')
        .setRequired(false)),

  async action(interaction) {
    const amount = interaction.options.getNumber('amount');
    const clubRate = interaction.options.getNumber('clubrate');
    const worker = interaction.options.getUser('worker', true);
    const worker2 = interaction.options.getUser('worker2');

    if (amount <= 0 || clubRate < 0 || clubRate > 100) {
      return interaction.reply({ content: '請輸入正確數值：amount > 0、clubrate 0~100', ephemeral: true });
    }

    const clubFee = amount * (clubRate / 100);
    const workerGrossTotal = amount - clubFee;

    const workers = [worker];
    if (worker2) workers.push(worker2);

    const perWorkerGross = workerGrossTotal / workers.length;
    const perWorkerDelta = Math.round(perWorkerGross);

    const embed = new EmbedBuilder()
      .setTitle('💰 訂單分錢結果')
      .setColor('#00C853')
      .addFields(
        { name: '訂單總金額', value: `${amount.toFixed(2)} 元`, inline: true },
        { name: '俱樂部抽成', value: `${clubRate}% (${clubFee.toFixed(2)} 元)`, inline: true },
        { name: '打手可分總額', value: `${workerGrossTotal.toFixed(2)} 元`, inline: true },
        { name: '打手數量', value: `${workers.length}`, inline: true },
        { name: '每人應得', value: `${perWorkerGross.toFixed(2)} 元`, inline: true },
        { name: '系統入帳', value: `${perWorkerDelta} 元`, inline: true }
      );

    try {
      const updateResults = [];

      for (const w of workers) {
        const { balanceBefore, balanceAfter } = await adjustBalance({
          userId: w.id,
          username: w.username,
          delta: perWorkerDelta,
          type: 'commission',
          note: `訂單 ${amount}，俱樂部抽成 ${clubRate}%，打手 ${w.username}`,
          actorId: interaction.user.id,
        });
        updateResults.push({ w, balanceBefore, balanceAfter });
      }

      updateResults.forEach(r => {
        embed.addFields({
          name: `${r.w.username} 餘額`,
          value: `入帳前：${r.balanceBefore} 元\n入帳後：${r.balanceAfter} 元`,
          inline: false,
        });
      });

      await interaction.reply({ embeds: [embed] });

      if (typeof sendLog === 'function') {
        const workerTags = workers.map(w => w.tag).join(',');
        sendLog(`commission: amount=${amount} clubRate=${clubRate} workers=${workerTags} net=${perWorkerDelta}`);
      }
    } catch (error) {
      console.error('commission 錯誤：', error);
      await interaction.reply({ content: '❌ 分錢失敗，請確認系統是否可寫入銀行檔案', ephemeral: true });
    }
  },
};
