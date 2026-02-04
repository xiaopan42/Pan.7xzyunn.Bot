import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
  category: '用戶指令',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('顯示用戶資訊')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要查詢的用戶 (預設為自己)')
        .setRequired(false)
    ),

  async action(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);

    // 時間格式化
    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    // 建立 Embed
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.username} 的資訊`)
      .setColor(member?.displayColor || '#00BFFF')
      .setThumbnail(user.avatarURL({ size: 512 }))
      .addFields(
        { name: '📌 用戶ID', value: user.id, inline: true },
        { name: '📛 用戶名稱', value: user.username, inline: true },
        { name: '🏷️ 標籤', value: user.tag, inline: true },
        { name: '📅 帳號建立', value: formatDate(user.createdTimestamp), inline: false }
      );

    // 如果是伺服器成員，添加成員資訊
    if (member) {
      embed.addFields(
        { name: '📍 加入伺服器', value: formatDate(member.joinedTimestamp), inline: false },
        {
          name: '👑 身份組',
          value: member.roles.cache.filter(r => r.id !== interaction.guildId).map(r => r.toString()).join(', ') || '無',
          inline: false
        },
        {
          name: '🎯 權限數量',
          value: member.permissions.toArray().length.toString(),
          inline: true
        }
      );

      // 如果有暱稱
      if (member.nickname) {
        embed.addFields({
          name: '💬 伺服器暱稱',
          value: member.nickname,
          inline: true
        });
      }
    }

    // 特殊身份標記
    const badges = [];
    if (user.bot) badges.push('🤖 機器人');
    if (user.system) badges.push('⚙️ 系統用戶');
    if (interaction.guild && member?.permissions.has('Administrator')) badges.push('👑 管理員');

    if (badges.length > 0) {
      embed.addFields({
        name: '✨ 特殊身份',
        value: badges.join(' | '),
        inline: false
      });
    }

    embed
      .setFooter({ text: `requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
