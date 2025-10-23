import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import fg from 'fast-glob';
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

export const commands = [];

export async function loadCommands() {
  console.log('(🌀)開始載入指令...');

  if (!process.env.TOKEN || !process.env.APPLICATION_ID) {
    console.error('(❌)缺少 TOKEN 或 APPLICATION_ID，請檢查 .env');
    return;
  }

  const files = await fg('src/commands/**/index.js');
  if (files.length === 0) {
    console.warn('(⚠️)未找到任何指令檔案');
  }

  commands.length = 0;

  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(path.resolve(process.cwd(), file)).href;
      const mod = await import(moduleUrl);

      if (mod.command) {
        if (typeof mod.command.toJSON === 'function') {
          commands.push({ data: mod.command, action: mod.action || null });
          console.log(`(✅)已載入指令: ${mod.command.name}`);
        } else {
          commands.push(mod.command);
          console.log(`(✅)已載入一般模組: ${file}`);
        }
      } else {
        console.warn(`(⚠️)指令檔案 ${file} 沒有 export const command`);
      }
    } catch (err) {
      console.error(`(❌)載入指令檔 ${file} 時發生錯誤:`, err);
    }
  }

  const payload = commands
    .map(c => (c && c.data && typeof c.data.toJSON === 'function' ? c.data.toJSON() : null))
    .filter(Boolean);

  if (payload.length === 0) {
    console.warn('(⚠️)沒有任何有效的 Slash 指令可註冊');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {

    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID),
      { body: payload }
    );

    console.log(`(🚀)成功註冊 ${payload.length} 個指令到 Discord`);
  } catch (err) {
    console.error('(❌)註冊指令到 Discord 失敗:', err);
  }

  console.log('(✅)指令載入完成\n');
  return commands;
}
