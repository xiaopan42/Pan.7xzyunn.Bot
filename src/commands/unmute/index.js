import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '管理指令',
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('解除禁言指定成員')
    .addUserOption(o => o.setName('target').setDescription('要解除禁言的成員').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.MuteMembers))
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });

    const user = interaction.options.getUser('target');

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.timeout(null);
      await interaction.reply(`✅ 已解除 **${user.tag}** 的禁言`);

      await sendLog(
        interaction.client,
        'admin',
        '執行指令',
        interaction,
        `使用者執行了 **/${interaction.commandName}**\n目標：${user.tag}`
      );
    } catch (err) {
      await interaction.reply({ content: '❌ 無法解除禁言該成員', ephemeral: true });
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
