import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

export const commands = [];

export async function loadCommands() {
  // 取得所有指令檔
  const files = await fg('src/commands/**/index.js');

  // 清空舊的
  commands.length = 0;

  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.resolve(process.cwd(), file)).href;
      const mod = await import(moduleUrl);

      if (mod.command) {
        if (typeof mod.command.toJSON === 'function') {
          commands.push({ data: mod.command, action: mod.action || null });
        } else {
          commands.push(mod.command);
        }
      } else {
        console.warn(`指令檔案 ${file} 沒有 export const command`);
      }
    } catch (err) {
      console.error(`載入指令檔 ${file} 發生錯誤:`, err);
    }
  }

  // 轉換成 Discord JSON 格式
  const payload = commands
    .map(c => (c && c.data && typeof c.data.toJSON === 'function' ? c.data.toJSON() : null))
    .filter(Boolean);

  // 註冊到 Discord
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: payload }
    );
    console.log(`已重新載入 ${payload.length} 個指令`);
  } catch (err) {
    console.error('註冊指令到 Discord 失敗:', err);
  }

  return commands;
}
