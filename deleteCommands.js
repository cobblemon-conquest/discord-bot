const { REST, Routes } = require('discord.js');
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);
// ...
// for guild-based commands
rest
	.delete(Routes.applicationGuildCommand('1467955801162387518', '1466849769346301964', '1467961887105745070'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);