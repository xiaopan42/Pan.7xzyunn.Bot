import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { loadCommands } from './core/loader.js';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { sendLog } from './store/logger.js';
import chalk from 'chalk';
process.removeAllListeners('warning');

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 🟢 載入事件
async function loadEvents() {
  const files = await fg('src/events/**/index.js');
  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    if (mod.event) {
      if (mod.event.once)
        client.once(mod.event.name, (...args) => mod.event.execute(...args));
      else
        client.on(mod.event.name, (...args) => mod.event.execute(...args));

      console.log(`🟢 已載入事件: ${mod.event.name}`);
    }
  }
}

// 🟢 啟動機器人
async function startBot() {
  await loadCommands();
  await loadEvents();
  await client.login(process.env.TOKEN);

  // ✅ 不再在這裡監聽 ready（避免重複）
}

startBot();

// 🧩 驗證主日誌頻道（可手動呼叫）
export async function verifyMainLog(client) {
  const channelId = process.env.MAIN_LOG_CHANNEL_ID;
  if (!channelId) {
    console.log(chalk.red('❌ [LOG] 缺少 MAIN_LOG_CHANNEL_ID，請在 .env 裡設定！'));
    return;
  }

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.log(chalk.red(`❌ [LOG] 找不到頻道 ID：${channelId}`));
      return;
    }

    await channel.send('✅ Bot 已啟動並成功連線到主日誌頻道。');
    console.log(chalk.green(`✅ [LOG] 主日誌頻道檢查成功 (${channel.name})`));
  } catch (err) {
    console.log(chalk.red(`❌ [LOG] 無法發送訊息到日誌頻道：${err.message}`));
  }
}

// 🔻 下線通知
async function handleShutdown(reason) {
  console.log(`🔻 收到關閉訊號 (${reason})`);

  if (client && client.isReady()) {
    const embed = new EmbedBuilder()
      .setTitle('🔴 機器人下線通知')
      .setDescription(`Bot 即將下線。\n原因：${reason}`)
      .addFields({ name: '時間', value: new Date().toLocaleString('zh-TW') })
      .setColor('#FF0000')
      .setFooter({ text: '系統事件日誌' })
      .setTimestamp();

    await sendLog(client, 'system', '🔴 機器人下線', `原因：${reason}`, embed);
    await new Promise(r => setTimeout(r, 2000));
  }

  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('手動關閉 (SIGINT)'));
process.on('SIGTERM', () => handleShutdown('系統關閉 (SIGTERM)'));
