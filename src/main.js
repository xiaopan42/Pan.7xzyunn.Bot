import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './core/loader.js';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function loadEvents() {
  const files = await fg('src/events/**/index.js');
  for (const file of files) {
    const mod = await import(pathToFileURL(file).href);
    if (mod.event) {
      if (mod.event.once) client.once(mod.event.name, (...args) => mod.event.execute(...args));
      else client.on(mod.event.name, (...args) => mod.event.execute(...args));
      console.log(`已載入事件: ${mod.event.name}`);
    } else {
      console.warn(`事件檔案 ${file} 沒有正確 export { event }`);
    }
  }
}

async function startBot() {
  await loadCommands(); 
  await loadEvents();   

  client.login(process.env.TOKEN);
}

startBot();