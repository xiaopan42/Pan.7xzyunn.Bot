import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { findPendingOrderByUser, updateOrderStatus } from '../../store/orders.js';

export const command = {
  category: '商城指令',
  data: new SlashCommandBuilder()
    .setName('訂單取消')
    .setDescription('取消訂單通知')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('用戶').setDescription('用戶').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('訂單編號').setDescription('訂單編號（可選）').setRequired(false)
    ),

  async action(interaction) {
    const orderNo = interaction.options.getString('訂單編號', false);
    const user = interaction.options.getUser('用戶', true);

    const order = await findPendingOrderByUser(user.id, orderNo || undefined);
    if (!order) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFB020')
            .setTitle('查無訂單')
            .setDescription(
              orderNo
                ? `找不到 ${user.username} 的待取消訂單（編號：${orderNo}）。`
                : `找不到 ${user.username} 的待取消訂單。`
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    await updateOrderStatus(order.orderNo, 'cancelled', {
      cancelledBy: interaction.user.id,
    });

    const embed = new EmbedBuilder()
      .setColor('#8EC8FF')
      .setTitle(`<:check:1439939142145278012> 已取消 ${order.orderNo}（用戶：${user.username}）。`);

    await interaction.reply({ embeds: [embed] });
  },
};
