const redis = require("redis")

const client = redis.createClient({
    username: 'default',
    password: 'bQlQJP20GphDkQMUNEUzcLkCzyN4yY5g',
    socket: {
        host: 'redis-18958.c62.us-east-1-4.ec2.cloud.redislabs.com',
        port: 18958,
    }
});


client.on('connect', () => {
    console.log('redis is connected');
});

client.on('error', (err) => {
    console.log('redis is disconnected: ', err);
});

(async () => {
    try {
        await client.connect();

    } catch (error) {
        console.error('error while connecting redis', error);
    }
})()


module.exports = client