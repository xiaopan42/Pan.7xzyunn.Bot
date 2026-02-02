import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '管理指令',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('暫時禁言指定成員')
    .addUserOption(o => o.setName('target').setDescription('要禁言的成員').setRequired(true))
    .addIntegerOption(o =>
      o.setName('minutes').setDescription('禁言的分鐘數').setRequired(true)
    )
    .addStringOption(o => o.setName('reason').setDescription('禁言原因'))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.MuteMembers))
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });

    const user = interaction.options.getUser('target');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      const ms = minutes * 60 * 1000;
      await member.timeout(ms, reason);
      const embed = new EmbedBuilder()
        .setColor('#ff4747')
        .setTitle('✅ 成員已禁言')
        .setDescription(
          `👤 **${user.tag}** 已被禁言\n⏳ 時長：${minutes} 分鐘\n📝 原因：${reason}`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      await interaction.reply({ content: '❌ 無法禁言該成員', ephemeral: true });
      await sendLog(
        interaction.client,
        'error',
        '指令錯誤',
        interaction,
        `執行 **/${interaction.commandName}** 時發生錯誤：${err.message}`
      );
    }
  },
};
