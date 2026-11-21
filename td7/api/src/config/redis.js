import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('Connecting to Redis...');
});

client.on('ready', () => {
    console.log('Redis is ready!');
});

export default client;
