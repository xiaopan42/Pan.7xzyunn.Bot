import path from 'path';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

export const commands = [];

export async function loadCommands() {
  const files = await fg('src/commands/**/index.js');
  commands.length = 0;

  for (const file of files) {
    const moduleUrl = pathToFileURL(path.resolve(file)).href;
    const mod = await import(moduleUrl);
    if (mod.command) commands.push(mod.command);
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(
    Routes.applicationCommands(process.env.APPLICATION_ID),
    { body: commands.map(c => c.data.toJSON()) }
  );
  console.log(`✅ 已註冊 ${commands.length} 個指令`);
}
