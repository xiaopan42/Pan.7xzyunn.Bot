import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { adjustBalance } from '../../store/bank.js';

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
    .setName('存款')
    .setDescription('替指定用戶增加存款')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('用戶').setDescription('要存款的用戶').setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('金額')
        .setDescription('存款金額（整數）')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option.setName('備註').setDescription('備註（可選）').setRequired(false)
    ),

  async action(interaction) {
    const user = interaction.options.getUser('用戶', true);
    const amount = interaction.options.getInteger('金額', true);
    const note = interaction.options.getString('備註') || '無';

    try {
      const { balanceBefore, balanceAfter } = await adjustBalance({
        userId: user.id,
        username: user.username,
        delta: amount,
        type: 'deposit',
        note,
        actorId: interaction.user.id,
      });

      const embed = new EmbedBuilder()
        .setColor('#8EC8FF')
        .setTitle('<:check:1439939142145278012> 存款成功')
        .addFields(
          { name: '用戶', value: `\`\`\`${user.username}\`\`\``, inline: false },
          { name: '存款金額', value: `\`\`\`${amount} 元\`\`\``, inline: true },
          { name: '存款前餘額', value: `\`\`\`${balanceBefore} 元\`\`\``, inline: true },
          { name: '最新餘額', value: `\`\`\`${balanceAfter} 元\`\`\``, inline: true },
          { name: '備註', value: `\`\`\`${note}\`\`\``, inline: false },
          { name: '時間', value: `\`\`\`${formatDateTime(new Date())}\`\`\``, inline: false }
        )
        .setFooter({ text: `由 ${interaction.user.username} 操作 | PnY娛樂俱樂部` });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ 存款失敗:', err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ 存款失敗')
            .setDescription('處理存款時發生錯誤，請稍後再試。'),
        ],
        ephemeral: true,
      });
    }
  },
};
