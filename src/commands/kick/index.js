import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('踢出指定成員')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('要踢出的成員')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('踢出原因')
        .setRequired(false)
    ),

  async action(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令', ephemeral: true });
    }

    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '未提供原因';

    try {
      const member = await interaction.guild.members.fetch(user.id);
      await member.kick(reason);
      await interaction.reply({ content: `已踢出成員.**${user.tag}** / 原因 ${reason}`, ephemeral: true });
    } catch (err) {
      console.error('踢出失敗:', err);
      await interaction.reply({ content: '無法踢出該成員 可能權限不足或該成員不存在 ', ephemeral: true });
    }
  },
};
