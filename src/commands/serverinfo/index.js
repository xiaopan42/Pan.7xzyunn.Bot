import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
  category: '伺服器指令',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('顯示伺服器資訊'),

  async action(interaction) {
    const guild = interaction.guild;

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

    // 計算成員統計（使用快取避免超時）
    const members = guild.members.cache;
    const botCount = members.filter(m => m.user.bot).size;
    const userCount = members.filter(m => !m.user.bot).size;

    // 頻道統計
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;

    // 驗證等級對應
    const verificationLevels = {
      0: '無',
      1: '低',
      2: '中',
      3: '高',
      4: '最高'
    };

    // 建立 Embed
    const embed = new EmbedBuilder()
      .setTitle(`🏠 ${guild.name} 伺服器資訊`)
      .setColor('#00BFFF')
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(
        { name: '🪪 伺服器ID', value: guild.id, inline: true },
        { name: '👑 伺服器擁有者', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 建立時間', value: formatDate(guild.createdTimestamp), inline: false },
        { name: '👥 成員總數', value: `${guild.memberCount} 人`, inline: true },
        { name: '🧑 一般用戶', value: `${userCount} 人`, inline: true },
        { name: '🤖 機器人', value: `${botCount} 個`, inline: true },
        { name: '💬 文字頻道', value: `${textChannels} 個`, inline: true },
        { name: '🔊 語音頻道', value: `${voiceChannels} 個`, inline: true },
        { name: '👑 身份組數量', value: `${guild.roles.cache.size} 個`, inline: true },
        { name: '🛡️ 驗證等級', value: verificationLevels[guild.verificationLevel], inline: true },
        { name: '🌍 地區', value: guild.preferredLocale || '未設定', inline: true },
        { name: '⚡ 加速等級', value: guild.premiumTier ? `Level ${guild.premiumTier}` : '無', inline: true }
      )
      .setFooter({ text: `requested by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
