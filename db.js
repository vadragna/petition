var express = require("express");
var app = express();

const spicePg = require("spiced-pg");

const db = spicePg("postgres://postgres:postgres@localhost:5432/petition");

console.log("db", db);

app.use(express.static("./static"));

exports.addSigner = function(sig, user_id) {
    // let userId = db.query("SELECT id FROM users");
    return db.query(
        `INSERT INTO signatures (sig, user_id)
    VALUES ($1, $2) returning user_id`,
        [sig, user_id]
    );
};

exports.getSigners = function() {
    return db.query(`SELECT first, last FROM users
    LEFT JOIN user_profiles
    ON user_id = users.id`);
};

exports.addUser = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, password)
VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

exports.newProfile = function(age, city, hp, userId) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
VALUES ($1, $2, $3, $4) returning id`,
        [age, city, hp, userId]
    );
};

exports.getEmail = function(email) {
    return db.query(`SELECT email FROM users WHERE email='${email}'`);
};

exports.getPassword = function(password, email) {
    return db.query(`SELECT * FROM users WHERE email='${email}'`);
};

exports.getUserId = function(email) {
    return db.query(`SELECT id FROM users WHERE email='${email}'`);
};

exports.getSigId = function(sig) {
    return db.query(`SELECT * FROM signatures WHERE sig='${sig}'`);
};

exports.getSigImg = function(user_id) {
    return db.query(`SELECT * FROM signatures WHERE user_id='${user_id}'`);
};

// WHERE email=${email}
// DROP TABLE IF EXISTS signatures;
//
// CREATE TABLE signatures (
//
// id SERIAL PRIMARY KEY,
//
// first VARCHAR NOT NULL CHECK (first != ''),
// last VARCHAR NOT NULL CHECK (last != ''),
// sig VARCHAR NOT NULL CHECK (sig != '')
// );
