import { REST, Routes } from "discord.js"

const updateSlashCommands = () => {
    const rest = new REST({version:10}).setToken(process.env.TOKEN)
    rest.put(
        Routes.applicationGuildCommands(
            process.env.APPLICATION_ID  
        )
    )
}