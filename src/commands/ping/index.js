import {SlashCommandBuilder} from 'discord.js'

const command=new SlashCommandBuilder()
    .setName('ping')
    .setDescription('ping command')

export const action = async (ctx) => {
    ctx.reply('pong')
}