import { Client, Events, GatewayIntentBits } from 'discord.js'
import vuelnit from '@/core/vue'
import dotenv from 'dotenv'

import { loadCommands } from '@/core/loader'

loadCommands()

vuelnit()
dotenv.config()

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`準備成功! 正在登入機器人 ${readyClient.user.tag}`);
});

client.login(process.env.TOKEN)