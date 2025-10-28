import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
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
      const fn = (...args) => mod.event.execute(...args);
      mod.event.once ? client.once(mod.event.name, fn) : client.on(mod.event.name, fn);
      console.log(`🟢 已載入事件: ${mod.event.name}`);
    }
  }
}

// 🚀 啟動機器人
async function startBot() {
  try {
    await loadCommands();
    await loadEvents();
    await client.login(process.env.TOKEN);
    console.log(chalk.green(`✅ | ${client.user.tag} 已上線 (${client.guilds.cache.size} 個伺服器)`));
  } catch (err) {
    console.error(chalk.red('❌ 登入失敗：'), err);
  }
}

startBot();

// 🔻 下線通知
async function handleShutdown(reason) {
  console.log(chalk.yellow(`🔻 收到關閉訊號 (${reason})`));

  if (client && client.isReady()) {
    try {
      await sendLog(
        client,
        'system',
        '機器人下線通知',
        null,
        `Bot 即將下線。\n原因：${reason}\n時間：${new Date().toLocaleString('zh-TW')}`,
        '#FF0000'
      );
      console.log(chalk.red('📤 已發送下線通知日誌'));
      // 等待訊息送完
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error('❌ 發送下線通知失敗:', err);
    }
  } else {
    console.warn('⚠️ Client 尚未就緒，略過下線通知');
  }

  process.exit(0);
}

// 📦 系統訊號監聽
process.on('SIGINT', () => handleShutdown('手動關閉 (Ctrl+C / SIGINT)'));
process.on('SIGTERM', () => handleShutdown('系統關閉 (SIGTERM)'));

// ⚠️ 捕捉未預期錯誤也記錄
process.on('uncaughtException', async (err) => {
  console.error('💥 未捕捉例外:', err);
  if (client && client.isReady()) {
    await sendLog(
      client,
      'error',
      '未捕捉例外錯誤',
      null,
      `錯誤：${err.message || err}\n時間：${new Date().toLocaleString('zh-TW')}`,
      '#FF0000'
    );
  }
  process.exit(1);
});
