import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
  category: '娛樂指令',
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('神奇8號球 - 尋求宇宙的答案')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('請問你的問題')
        .setRequired(true)
    ),

  async action(interaction) {
    const question = interaction.options.getString('question');

    // 神奇8號球的回答
    const answers = {
      肯定: [
        '是的',
        '當然',
        '絕對',
        '沒問題',
        '肯定沒錯',
        '就是這樣',
        '毫無疑問',
        '確定',
        '再肯定不過了',
        '非常有可能'
      ],
      否定: [
        '不',
        '絕對不',
        '不可能',
        '打死都不',
        '別想',
        '沒門',
        '休想',
        '否定',
        '一點都不',
        '肯定不行'
      ],
      非確定: [
        '也許',
        '有可能',
        '很難說',
        '問得好',
        '一切皆有可能',
        '難以預測',
        '現在無法判斷',
        '需要時間',
        '兩說',
        '再想想'
      ]
    };

    // 隨機選擇類別和答案
    const categories = Object.keys(answers);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const answerList = answers[category];
    const answer = answerList[Math.floor(Math.random() * answerList.length)];

    // 顏色對應
    const colors = {
      肯定: '#00FF00',
      否定: '#FF0000',
      非確定: '#FFFF00'
    };

    const embed = new EmbedBuilder()
      .setTitle('🎱 神奇8號球')
      .setColor(colors[category])
      .addFields(
        { name: '❓ 提出的問題', value: question, inline: false },
        { name: '✨ 宇宙的答案', value: `**${answer}**`, inline: false }
      )
      .setFooter({ text: `asked by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
