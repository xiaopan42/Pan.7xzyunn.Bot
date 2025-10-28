import { SlashCommandBuilder } from 'discord.js';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '特殊指令(僅限擁有者)',
  data: new SlashCommandBuilder()
    .setName('testreconnect')
    .setDescription('🔒模擬機器人重新連線（僅限擁有者）'),

  async action(interaction) {
    // ✅ 確認執行者是否為擁有者
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ content: '❌ 你沒有權限使用這個指令。', ephemeral: true });
    }

    await interaction.reply({ content: '♻️ 模擬重新連線中...', ephemeral: true });

    const client = interaction.client;

    try {
      // 🔸 發送「重連中」日誌
      await sendLog(
        client,
        'reconnect',
        '模擬重新連線中',
        interaction,
        `執行者：${interaction.user.tag}\n時間：${new Date().toLocaleString('zh-TW')}`,
        '#FFD700'
      );

      // 🔹 模擬斷線
      await client.destroy();
      await new Promise(r => setTimeout(r, 3000)); // 停 3 秒

      // 🔹 重新登入
      await client.login(process.env.TOKEN);

      // 🔸 發送「重連成功」日誌
      await sendLog(
        client,
        'system',
        '模擬重新連線成功',
        interaction,
        `機器人已重新登入 Discord。\n時間：${new Date().toLocaleString('zh-TW')}`,
        '#00FF00'
      );

      await interaction.followUp({ content: '✅ 測試完成：機器人已重新連線。', ephemeral: true });
    } catch (err) {
      console.error('❌ 模擬重連錯誤:', err);
      await interaction.followUp({ content: '❌ 測試失敗，請查看控制台錯誤。', ephemeral: true });
    }
  },
};
