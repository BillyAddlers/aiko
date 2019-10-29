const Client = require('./structures/AikoClient.js');

const client = new Client({ disableEveryone: true });

client.on('warn', console.warn);
client.on('error', console.error);

require('./util/eventHandler')(client);

client.login(client.config.env.TOKEN);
