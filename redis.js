var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

const { promisify } = require("util");
exports.get = promisify(client.get.bind(client));
exports.setex = promisify(client.get.bind(client));
exports.del = promisify(client.get.bind(client));
