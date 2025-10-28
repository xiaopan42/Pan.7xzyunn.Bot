import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '管理指令',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('踢出指定成員')
    .addUserOption(o => o.setName('target').setDescription('要踢出的成員').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('踢出原因'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers))
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });

    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);
      await interaction.reply(`✅ 已踢出使用者 **${user.tag}**。理由：${reason}`);

    } catch (err) {
      await interaction.reply({ content: '❌ 無法踢出該成員', ephemeral: true });
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
