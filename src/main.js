import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './core/loader.js';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { sendLog } from './store/logger.js';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function loadEvents() {
  const files = await fg('src/events/**/index.js');
  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    if (mod.event) {
      if (mod.event.once) client.once(mod.event.name, (...args) => mod.event.execute(...args));
      else client.on(mod.event.name, (...args) => mod.event.execute(...args));
      console.log(`🟢-已載入事件: ${mod.event.name}`);
    }
  }
}

async function startBot() {
  await loadCommands(); // 確保這是函式
  await loadEvents();
  client.login(process.env.TOKEN);
}

startBot();

// 捕捉手動 Ctrl + C 關閉
process.on('SIGINT', async () => {
  console.log('🔻 收到 SIGINT (Ctrl + C)');
  if (client && client.isReady()) {
    await sendLog(
      client,
      'system',
      '🔻 機器人關閉',
      'Bot 收到手動關閉訊號 (SIGINT)。',
      null,
      '#FF0000' // 🔴 紅色
    );
    await new Promise(r => setTimeout(r, 2000)); // 延遲 2 秒
  }
  process.exit(0);
});

// 捕捉系統關閉（如 pm2 stop）
process.on('SIGTERM', async () => {
  console.log('🔻 收到 SIGTERM (系統關閉)');
  if (client && client.isReady()) {
    await sendLog(
      client,
      'system',
      '🔻 機器人關閉',
      'Bot 因系統關閉事件 (SIGTERM) 即將離線。',
      null,
      '#FF0000' // 🔴 紅色
    );
    await new Promise(r => setTimeout(r, 2000));
  }
  process.exit(0);
});