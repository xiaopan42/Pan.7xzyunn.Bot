import { EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

export async function sendLog(client, type, title, description, originGuild, customColor) {
  if (!client || !client.guilds) {
    console.warn('⚠️ 無法發送日誌：client 尚未初始化');
    return;
  }

  const mainGuildId = process.env.MAIN_GUILD_ID;
  const logChannelId = process.env.MAIN_LOG_CHANNEL_ID;
  if (!mainGuildId || !logChannelId) {
    console.warn('⚠️ 未設定 MAIN_GUILD_ID 或 MAIN_LOG_CHANNEL_ID');
    return;
  }

  const mainGuild = await client.guilds.fetch(mainGuildId).catch(() => null);
  if (!mainGuild) return console.warn('⚠️ 找不到主伺服器');
  const logChannel = await mainGuild.channels.fetch(logChannelId).catch(() => null);
  if (!logChannel) return console.warn('⚠️ 找不到日誌頻道');

  const color = customColor || (
    type === 'system' ? '#00BFFF' :   
    type === 'admin' ? '#FF4444' :    
    type === 'command' ? '#00FF7F' :  
    '#AAAAAA'                         
  );

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .addFields(
      originGuild
        ? [{ name: '來源伺服器', value: `${originGuild.name} (${originGuild.id})` }]
        : []
    )
    .setColor(color)
    .setTimestamp();

  await logChannel.send({ embeds: [embed] });
}
