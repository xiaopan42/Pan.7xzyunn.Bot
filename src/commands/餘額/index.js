import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getBalance } from '../../store/bank.js';

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

export const command = {
  category: '銀行指令',
  data: new SlashCommandBuilder()
    .setName('餘額')
    .setDescription('查看用戶存款餘額')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('用戶').setDescription('要查看的用戶（可選）').setRequired(false)
    ),

  async action(interaction) {
    const target = interaction.options.getUser('用戶') || interaction.user;

    const isSelf = target.id === interaction.user.id;

    try {
      const balance = await getBalance(target.id);
      const embed = new EmbedBuilder()
        .setColor('#8EC8FF')
        .setTitle('<:check:1439939142145278012> 餘額查詢')
        .addFields(
          { name: '用戶', value: `\`\`\`${target.username}\`\`\``, inline: false },
          { name: '目前餘額', value: `\`\`\`${balance} 元\`\`\``, inline: false },
          { name: '時間', value: `\`\`\`${formatDateTime(new Date())}\`\`\``, inline: false }
        )
        .setFooter({ text: `由 ${interaction.user.username} 查詢 | PnY娛樂俱樂部` });

      await interaction.reply({ embeds: [embed], ephemeral: isSelf });
    } catch (err) {
      console.error('❌ 查詢餘額失敗:', err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ 查詢失敗')
            .setDescription('查詢餘額時發生錯誤，請稍後再試。'),
        ],
        ephemeral: true,
      });
    }
  },
};
