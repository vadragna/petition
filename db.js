var express = require("express");
var app = express();

const spicePg = require("spiced-pg");

const db = spicePg("postgres://postgres:postgres@localhost:5432/petition");

console.log("db", db);

app.use(express.static("./static"));

exports.addSigner = function(first, last, sig) {
    return db.query(
        `INSERT INTO signatures (first, last, sig)
    VALUES ($1, $2, $3) returning id`,
        [first, last, sig]
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
