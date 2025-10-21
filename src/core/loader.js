import { REST, Routes } from 'discord.js';
import fg from 'fast-glob';

// 用純 JS 儲存指令
const appStore = {
  commands: [],
  setCommands(cmds) { this.commands = cmds; },
  getCommands() { return this.commands; }
};

const updateSlashCommands = async (commands) => {
  const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);

  try {
    const result = await rest.put(
      Routes.applicationGuildCommands(
        process.env.APPLICATION_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log(`已重新載入 ${result.length} 個指令`);
  } catch (err) {
    console.error('更新指令失敗:', err);
  }
}

export const loadCommands = async () => {
  const commands = [];
  const files = await fg('./src/commands/**/index.js');

  for (const file of files) {
    const cmdModule = await import(file);
    if (!cmdModule.command) {
      console.warn(`指令檔案 ${file} 沒有 export const command`);
      continue;
    }
    commands.push(cmdModule.command.toJSON());
  }

  appStore.setCommands(commands);
  await updateSlashCommands(commands);
}

export const getCommandsFromStore = () => appStore.getCommands();