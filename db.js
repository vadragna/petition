var express = require("express");
var app = express();

const spicePg = require("spiced-pg");

const db = spicePg("postgres://postgres:postgres@localhost:5432/petition");

app.use(express.static("./static"));

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
