import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getAllAccounts } from '../../store/bank.js';

function formatNumber(num) {
  return new Intl.NumberFormat('zh-TW').format(num);
}

export const command = {
  category: '銀行指令',
  data: new SlashCommandBuilder()
    .setName('全部餘額')
    .setDescription('列出所有用戶的存款餘額（管理員專用）')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async action(interaction) {
    try {
      const accounts = await getAllAccounts();

      if (!accounts || accounts.length === 0) {
        return await interaction.reply({ content: '目前沒有資料。', ephemeral: true });
      }

      const sortedAccounts = accounts.slice().sort((a, b) => (b.balance || 0) - (a.balance || 0));
      const pageSize = 10;
      const totalPages = Math.max(1, Math.ceil(sortedAccounts.length / pageSize));
      let pageIndex = 0;

      const buildEmbed = (page) => {
        const start = page * pageSize;
        const pageItems = sortedAccounts.slice(start, start + pageSize);
        const description = pageItems
          .map((acct, idx) => {
            const rank = start + idx + 1;
            const username = acct.username || '未知';
            const balance = formatNumber(acct.balance ?? 0);
            return `**${rank}.** ${username} (<@${acct.userId}>) — **${balance} 元**`;
          })
          .join('\n');

        return new EmbedBuilder()
          .setColor('#8EC8FF')
          .setTitle('💰 全部用戶餘額')
          .setDescription(description || '本頁無資料。')
          .setFooter({ text: `第 ${page + 1}/${totalPages} 頁 · 共 ${sortedAccounts.length} 位用戶` })
          .setTimestamp(new Date());
      };

      const buildComponents = (page) => {
        return [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev_page')
              .setLabel('上一頁')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 0),
            new ButtonBuilder()
              .setCustomId('next_page')
              .setLabel('下一頁')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === totalPages - 1)
          ),
        ];
      };

      const msg = await interaction.reply({
        embeds: [buildEmbed(pageIndex)],
        components: buildComponents(pageIndex),
        ephemeral: true,
      });

      const collector = msg.createMessageComponentCollector({
        componentType: 2,
        time: 120000,
      });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.user.id !== interaction.user.id) {
          await buttonInteraction.reply({ content: '這個按鈕不是你的，無法操作。', ephemeral: true });
          return;
        }

        if (buttonInteraction.customId === 'prev_page' && pageIndex > 0) {
          pageIndex -= 1;
        } else if (buttonInteraction.customId === 'next_page' && pageIndex < totalPages - 1) {
          pageIndex += 1;
        }

        await buttonInteraction.update({
          embeds: [buildEmbed(pageIndex)],
          components: buildComponents(pageIndex),
        });
      });

      collector.on('end', async () => {
        try {
          await interaction.editReply({ components: [] });
        } catch (err) {
          // 忽略：訊息可能已刪除或無法編輯
        }
      });
    } catch (error) {
      console.error('全部餘額 指令出錯：', error);
      await interaction.reply({
        content: '執行指令時發生錯誤，請稍後再試。',
        ephemeral: true,
      });
    }
  },
};