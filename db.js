var express = require("express");
var app = express();

const spicePg = require("spiced-pg");

const db = spicePg("postgres://postgres:postgres@localhost:5432/petition");

console.log("db", db);

app.use(express.static("./static"));

exports.addSigner = function(sig, id) {
    let userId = db.query("SELECT id FROM users");
    console.log("userId", userId);
    return db.query(
        `INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2) returning user_id`,
        [sig, id]
    );
};

exports.getSigners = function() {
    let id = "SELECT id FROM signatures";
    return db.query("SELECT first, last FROM signatures");
};

exports.addUser = function(first, last, email, password) {
    return db.query(
        `INSERT INTO users (first, last, email, password)
VALUES ($1, $2, $3, $4)`,
        [first, last, email, password]
    );
};

exports.getEmail = function(email) {
    return db.query(`SELECT email FROM users WHERE email='${email}'`);
};

exports.getPassword = function(password, email) {
    return db.query(`SELECT password FROM users WHERE email='${email}'`);
};

exports.getUserId = function(email) {
    return db.query(`SELECT id FROM users WHERE email='${email}'`);
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
