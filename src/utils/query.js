// utils
const redis = require('async-redis');

const client = redis.createClient({
    host: "redis-17947.c100.us-east-1-4.ec2.cloud.redislabs.com",
    port: "17947"
});
client.auth('eEaZyZGtjHkBri7lxwz0Ew5gXWH98tO6');

const hash = 'synonymsappdb';

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

const query = {
    get, exists, set, keys, length
}

module.exports = query; 