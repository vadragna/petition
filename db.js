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
    return db.query("SELECT first, last FROM signatures");
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
