var express = require("express");
var app = express();

const spicePg = require("spiced-pg");

const db = spicePg(
    process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/petition"
);

app.use(express.static("./static"));

exports.addSigner = function(sig, user_id) {
    return db.query(
        `INSERT INTO signatures (sig, user_id)
    VALUES ($1, $2) returning id`,
        [sig, user_id]
    );
};

exports.getSigners = function() {
    return db.query(`SELECT * FROM users
    LEFT JOIN user_profiles
    ON user_id = users.id`);
};

exports.getSignerFromCity = function(city) {
    let lowerCity = city.toLowerCase();
    console.log(lowerCity, "lowerCity");
    {
        return db.query(`SELECT * FROM users
        LEFT JOIN user_profiles
        ON user_id = users.id
        WHERE city='${lowerCity}'
        OR city='${city}'`);
    }
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

exports.getDataFromEmail = function(email) {
    return db.query(`SELECT * FROM users
        LEFT JOIN signatures
        ON user_id = users.id
        WHERE email='${email}'`);
};

exports.getPassword = function(email) {
    console.log("email in db.js", email);
    return db.query(`SELECT * FROM users WHERE email='${email}'`);
};

exports.getUserId = function(email) {
    return db.query(`SELECT id FROM users WHERE email='${email}'`);
};

exports.getSigImg = function(user_id) {
    return db.query(`SELECT * FROM users
        LEFT JOIN signatures
        ON user_id = users.id
        WHERE user_id='${user_id}'`);
};

exports.getAllUserData = function(userId) {
    return db.query(`SELECT * FROM users
        LEFT JOIN user_profiles
        ON user_id = users.id
        WHERE user_id='${userId}'`);
};

exports.updateUsersTable = function(userId, first, last, email) {
    return db.query(
        `UPDATE users
     SET first =$2, last=$3, email=$4
     WHERE id=$1`,
        [userId, first, last, email]
    );
};

exports.updateUsersTableWithPw = function(
    userId,
    first,
    last,
    email,
    password
) {
    return db.query(
        `UPDATE users
     SET first =$2, last=$3, email=$4, password=$5
     WHERE id=$1`,
        [userId, first, last, email, password]
    );
};

exports.updateProfile = function(age, city, url, userId) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO
        UPDATE SET age = $1, city = $2, url = $3`,
        [age || null, city || null, url || null, userId]
    );
};

exports.deleteSig = function(userId) {
    return db.query(
        `DELETE from signatures
        WHERE user_id='${userId}'`
    );
};
