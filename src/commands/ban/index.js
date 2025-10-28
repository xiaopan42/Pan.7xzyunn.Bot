import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { logAdmin } from '../../store/logger.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('封鎖指定成員')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('target').setDescription('要封鎖的成員').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('封鎖原因').setRequired(false)
    ),

  async action(interaction) {
    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '未提供原因';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member)
      return interaction.reply({ content: '⚠️ 找不到該成員', ephemeral: true });

    if (!member.bannable)
      return interaction.reply({ content: '❌ 我無法封鎖該成員（權限不足）', ephemeral: true });

    try {
      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor('#ff4747')
        .setTitle('✅ 成員已封鎖')
        .setDescription(`👤 **${user.tag}** 已被封鎖\n📝 理由：${reason}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      await logAdmin(interaction, '封鎖使用者', `目標：${user.tag}\n原因：${reason}`);
    } catch (err) {
      console.error('封鎖失敗:', err);
      await interaction.reply({ content: '❌ 封鎖過程發生錯誤', ephemeral: true });
    }
  },
};
