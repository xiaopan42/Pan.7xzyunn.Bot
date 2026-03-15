import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { createReview } from '../../store/reviews.js';

const REVIEW_CHANNEL_ID = process.env.REVIEW_CHANNEL_ID;
const OPEN_REVIEW_BUTTON_ID_PREFIX = 'review:open';
const REVIEW_RATING_SELECT_ID_PREFIX = 'review:rating';
const REVIEW_MODAL_ID_PREFIX = 'review:modal';
const CHECK_EMOJI = '<:check:1439939142145278012>';
const LIGHT_BLUE = '#8EC8FF';

function toStars(rating) {
  return '⭐'.repeat(rating);
}

function formatTargets(targets) {
  if (!targets.length) return '未指定';
  return targets.map(user => `${user.username} (${user.id})`).join('\n');
}

function buildFlowId(prefix, requesterId, target1Id, target2Id) {
  return `${prefix}:${requesterId}:${target1Id || '0'}:${target2Id || '0'}`;
}

function parseFlowId(customId, prefix) {
  if (!customId?.startsWith(`${prefix}:`)) return null;
  const parts = customId.split(':');
  if (parts.length !== 5) return null;
  const [, , requesterId, target1Id, target2Id] = parts;
  return {
    requesterId,
    target1Id: target1Id === '0' ? null : target1Id,
    target2Id: target2Id === '0' ? null : target2Id,
  };
}

function buildModalId(requesterId, target1Id, target2Id, rating) {
  return `${REVIEW_MODAL_ID_PREFIX}:${requesterId}:${target1Id || '0'}:${target2Id || '0'}:${rating}`;
}

function parseModalId(customId) {
  if (!customId?.startsWith(`${REVIEW_MODAL_ID_PREFIX}:`)) return null;
  const parts = customId.split(':');
  if (parts.length !== 6) return null;
  const [, , requesterId, target1Id, target2Id, ratingRaw] = parts;
  const rating = Number(ratingRaw);
  return {
    requesterId,
    target1Id: target1Id === '0' ? null : target1Id,
    target2Id: target2Id === '0' ? null : target2Id,
    rating,
  };
}

function buildRatingSelect(customId, selectedRating = 0) {
  return new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder('先選擇評分星等')
    .addOptions(
      { label: '1 星', value: '1', default: selectedRating === 1 },
      { label: '2 星', value: '2', default: selectedRating === 2 },
      { label: '3 星', value: '3', default: selectedRating === 3 },
      { label: '4 星', value: '4', default: selectedRating === 4 },
      { label: '5 星', value: '5', default: selectedRating === 5 }
    );
}

async function sendToReviewChannel(interaction, savedReview, targets) {
  if (!REVIEW_CHANNEL_ID) return;

  try {
    const channel = await interaction.client.channels.fetch(REVIEW_CHANNEL_ID).catch(() => null);
    if (!channel || typeof channel.send !== 'function') return;

    const publicEmbed = new EmbedBuilder()
      .setColor(LIGHT_BLUE)
      .setTitle(`${CHECK_EMOJI} 新的評價`)
      .addFields(
        { name: '評分', value: `${toStars(savedReview.rating)} (${savedReview.rating}/5)`, inline: false },
        { name: '內容', value: savedReview.content || '（無）', inline: false },
        {
          name: '評價人',
          value: `${interaction.user.username} (${interaction.user.id})`,
          inline: false,
        },
        { name: '對象', value: formatTargets(targets), inline: false }
      )
      .setTimestamp(new Date(savedReview.createdAt));

    await channel.send({ embeds: [publicEmbed] });
  } catch (err) {
    console.error('發送評價到指定頻道失敗:', err);
  }
}

export const command = {
  category: '服務系統',
  data: new SlashCommandBuilder()
    .setName('評價')
    .setDescription('提交本次服務評價')
    .addUserOption(option =>
      option
        .setName('對象1')
        .setDescription('陪玩對象 1（選填）')
        .setRequired(false)
    )
    .addUserOption(option =>
      option
        .setName('對象2')
        .setDescription('陪玩對象 2（選填）')
        .setRequired(false)
    ),

  async action(interaction) {
    const target1 = interaction.options.getUser('對象1');
    const target2 = interaction.options.getUser('對象2');

    if (target1 && target2 && target1.id === target2.id) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFB020')
            .setTitle('提交失敗')
            .setDescription('對象1 與 對象2 不能是同一位使用者。'),
        ],
        ephemeral: true,
      });
      return;
    }

    const openId = buildFlowId(OPEN_REVIEW_BUTTON_ID_PREFIX, interaction.user.id, target1?.id, target2?.id);
    const exampleEmbed = new EmbedBuilder()
      .setColor(LIGHT_BLUE)
      .setTitle(`${CHECK_EMOJI} 請點擊填寫評價按鈕完成評價！`)
      .setDescription('期待您再次點 PnY 娛樂俱樂部 的陪玩！')
      .setTimestamp();

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(openId)
        .setLabel('填寫評價')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [exampleEmbed], components: [buttonRow] });
  },

  async componentAction(interaction) {
    if (interaction.isStringSelectMenu()) {
      const parsed = parseFlowId(interaction.customId, REVIEW_RATING_SELECT_ID_PREFIX);
      if (!parsed) return false;

      const rating = Number(interaction.values?.[0]);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        await interaction.reply({
          content: '星等格式錯誤，請重選。',
          ephemeral: true,
        });
        return true;
      }

      const modalId = buildModalId(parsed.requesterId, parsed.target1Id, parsed.target2Id, rating);
      const targetIds = [parsed.target1Id, parsed.target2Id].filter(Boolean);
      const fetchedTargets = await Promise.all(
        targetIds.map(id => interaction.client.users.fetch(id).catch(() => null))
      );
      const targets = fetchedTargets.filter(Boolean);
      const targetText = targets.length ? targets.map(user => user.username).join('、') : '未指定';

      const modal = new ModalBuilder().setCustomId(modalId).setTitle(`填寫評價（${rating} 星）`);
      const contentInput = new TextInputBuilder()
        .setCustomId('content')
        .setLabel(`評價內容｜對象：${targetText}`.slice(0, 45))
        .setPlaceholder('例如：配合度很好，服務流程清楚。')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

      modal.addComponents(new ActionRowBuilder().addComponents(contentInput));
      await interaction.showModal(modal);
      return true;
    }

    if (interaction.isButton()) {
      const parsed = parseFlowId(interaction.customId, OPEN_REVIEW_BUTTON_ID_PREFIX);
      if (!parsed) return false;

      const ratingSelectId = buildFlowId(
        REVIEW_RATING_SELECT_ID_PREFIX,
        parsed.requesterId,
        parsed.target1Id,
        parsed.target2Id
      );
      const selectEmbed = new EmbedBuilder()
        .setColor(LIGHT_BLUE)
        .setTitle('請先選擇星等')
        .setDescription('選擇完成後會直接開啟評價填寫視窗。');

      const selectRow = new ActionRowBuilder().addComponents(buildRatingSelect(ratingSelectId));

      await interaction.update({ embeds: [selectEmbed], components: [selectRow] });
      return true;
    }

    if (interaction.isModalSubmit()) {
      const parsed = parseModalId(interaction.customId);
      if (!parsed) return false;

      const content = interaction.fields.getTextInputValue('content').trim();
      const rating = parsed.rating;

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        await interaction.reply({
          content: '星等格式錯誤，請填 1 到 5 的整數。',
          ephemeral: true,
        });
        return true;
      }

      const targetIds = [parsed.target1Id, parsed.target2Id].filter(Boolean);
      const fetchedTargets = await Promise.all(
        targetIds.map(id => interaction.client.users.fetch(id).catch(() => null))
      );
      const targets = fetchedTargets.filter(Boolean);

      let savedReview;
      try {
        savedReview = await createReview({
          rating,
          content,
          reviewerId: interaction.user.id,
          reviewerName: interaction.user.username,
          targets: targets.map(user => ({ userId: user.id, username: user.username })),
        });
      } catch (err) {
        console.error('建立評價失敗:', err);
        await interaction.reply({
          content: '評價儲存失敗，請稍後再試。',
          ephemeral: true,
        });
        return true;
      }

      const confirmEmbed = new EmbedBuilder()
        .setColor(LIGHT_BLUE)
        .setTitle(`${CHECK_EMOJI} 評價提交成功`)
        .addFields(
          { name: '評分', value: `\`\`\`${toStars(rating)} (${rating}/5)\`\`\``, inline: false },
          { name: '內容', value: `\`\`\`${content}\`\`\``, inline: false },
          { name: '對象', value: `\`\`\`${formatTargets(targets)}\`\`\``, inline: false }
        )
        .setFooter({ text: `提交者: ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
      await sendToReviewChannel(interaction, savedReview, targets);
      return true;
    }

    return false;
  },
};
