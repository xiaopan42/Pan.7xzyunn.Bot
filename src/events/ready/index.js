// src/events/clientReady/index.js
import { Events } from 'discord.js';

export const event = {
  name: Events.ClientReady, 
  once: true,               
  execute(client) {         
    console.log(`準備成功! 正在登入機器人 ${client.user.tag}`);
    
    // 設定狀態欄
    client.user.setPresence({
      status: 'online', // online, idle, dnd, invisible
      activities: [{
        name: 'Pan.7xzyunn.Bot 0.1.0 by xiaopan.',
        type: 0, // 0 = Playing, 2 = Listening, 3 = Watching
      }],
    });
  },
};
