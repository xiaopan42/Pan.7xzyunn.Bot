import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getAllBalances } from '../../store/bank.js';

export const command = {
  category: '銀行指令',
  data: new SlashCommandBuilder()
    .setName('所有餘額')
    .setDescription('列出所有會員當前餘額（管理員專用）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async action(interaction) {
    try {
      const accounts = await getAllBalances();

      if (!accounts.length) {
        return interaction.reply({ content: '目前尚無帳戶資料。', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#8EC8FF')
        .setTitle('<:check:1439939142145278012> 全部帳戶餘額')
        .setDescription(accounts
          .sort((a, b) => b.balance - a.balance)
          .map((acc, index) => `**${index + 1}.** ${acc.username}（${acc.userId}）: ${acc.balance} 元`)
          .join('\n'))
        .setFooter({ text: `由 ${interaction.user.username} 查詢 | PnY娛樂俱樂部` });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error('❌ 查詢所有餘額失敗:', err);
      await interaction.reply({ content: '查詢失敗，請稍後再試。', ephemeral: true });
    }
  },
};