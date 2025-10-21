import { Client, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './core/loader.js'; // 直接用相對路徑

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 準備就緒事件
client.once(Events.ClientReady, (readyClient) => {
  console.log(`準備成功! 正在登入機器人 ${readyClient.user.tag}`);
});

// 指令互動事件
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    // 動態載入指令檔
    const cmdModule = await import(`./commands/${interaction.commandName}/index.js`);
    if (cmdModule?.action) {
      await cmdModule.action(interaction);
    } else {
      interaction.reply({ content: '這個指令還沒有實作', ephemeral: true });
    }
  } catch (err) {
    console.error(`無法執行指令 ${interaction.commandName}:`, err);
    interaction.reply({ content: '執行指令時發生錯誤', ephemeral: true });
  }
});

// 載入指令
loadCommands();

// 登入 Discord
client.login(process.env.TOKEN)
  .then(() => console.log('登入請求已送出'))
  .catch(err => console.error('登入失敗:', err));
