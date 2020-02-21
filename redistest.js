const { get, del, setex } = require("./redis.js");

get("funky").then(val => {
    console.log(val);
});

setex("funky", 20, "chicken").then(val => {
    get("funky", val);
});
