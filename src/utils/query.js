// utils
const redis = require('async-redis');

const client = redis.createClient({
    host: "redis-10506.c52.us-east-1-4.ec2.cloud.redislabs.com",
    port: "10506"
});
client.auth('fbQd1CwlHarHlaPuqm7tuAOYA74501FK');

const hash = 'synonymsappdatabase';

async function get(value) {
    const fieldValue = await client.hget(hash, value);
    let response = null;
    try {
        response = JSON.parse(fieldValue);
    } catch {
        response = [];
    }
    return response;
}
async function exists(value) {
    return await client.hexists(hash, value);
}
async function set(key, value) {
    return await client.hset(hash, key, JSON.stringify(value));
}
async function keys() {
    return await client.hkeys(hash);
}
async function length() {
    return await client.hlen(hash);
}
async function values() {
    return await client.hvals(hash);
}

const query = {
    get, exists, set, keys, length, values
}

module.exports = query; 