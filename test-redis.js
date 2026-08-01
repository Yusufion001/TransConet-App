import Redis from 'ioredis';
const client = new Redis('rediss://default:gQAAAAAAAp8aAAIgcDFmNDYzYTNlZGFkZDU0Yjc0YmU5MTlmOTYyMzdlYTk4OA@national-gull-171802.upstash.io:6379');
client.ping().then(console.log).catch(console.error).finally(() => process.exit());
