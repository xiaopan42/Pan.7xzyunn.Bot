import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { findPendingOrderByUser, updateOrderStatus } from '../../store/orders.js';

export const command = {
  category: '商城指令',
  data: new SlashCommandBuilder()
    .setName('訂單完成')
    .setDescription('提示客人填寫評價')
    .addUserOption(option =>
      option.setName('用戶').setDescription('要完成訂單的用戶').setRequired(true)
    ),

  async action(interaction) {
    const user = interaction.options.getUser('用戶', true);

    const order = await findPendingOrderByUser(user.id);
    if (!order) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFB020')
            .setTitle('查無訂單')
            .setDescription(`找不到 ${user.username} 的待完成訂單。`),
        ],
        ephemeral: true,
      });
      return;
    }

    await updateOrderStatus(order.orderNo, 'completed', {
      completedBy: interaction.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor('#8EC8FF')
      .setTitle(`<:check:1439939142145278012> 訂單 ${order.orderNo} 已完成（用戶：${user.username}）`)
      .setDescription('期待您再次點【PnY 娛樂俱樂部】的陪玩！');

    await interaction.reply({ embeds: [embed] });
  },
};
