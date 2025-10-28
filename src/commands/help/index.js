import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fg from 'fast-glob';
import path from 'path';
import { pathToFileURL } from 'url';
import { sendLog } from '../../store/logger.js';

export const command = {
  category: '一般指令',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('顯示所有可用指令'),

  async action(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const files = await fg('src/commands/**/index.js');
    const categories = {};

    for (const file of files) {
      const mod = await import(pathToFileURL(path.resolve(file)).href);
      const data = mod.command?.data;
      if (!data) continue;

      const category = mod.command?.category || '一般指令';
      if (!categories[category]) categories[category] = [];

      categories[category].push({
        name: `/${data.name}`,
        description: data.description || '（無描述）',
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📖 指令清單')
      .setColor('#00BFFF')
      .setDescription('以下是目前機器人可用的分類指令：')
      .addFields(
        Object.entries(categories).map(([cat, cmds]) => ({
          name: `📂 ${cat}`,
          value:
            cmds.map(c => `> 💠 **${c.name}** — ${c.description}`).join('\n') +
            '\n━━━━━━━━━━━━━━━━━━',
          inline: false,
        }))
      )
      .setFooter({ text: 'Pan.7xzyunn.Bot | 自動生成指令清單' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // ✅ 日誌
    await sendLog(
      interaction.client,
      'command',
      '使用指令',
      interaction,
      `使用者執行了 **/${interaction.commandName}**`
    );
  },
};
