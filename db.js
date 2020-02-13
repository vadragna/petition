const spicePg = require("spiced-pg");

const db = spicePg("postgres://postgres:postgres@localhost:5432/petition");

app.use(express.static("./static"));

// db.query("").then(({ rows }) => {
//     console.log(rows);
// });
// db.query("SELECT * FROM petition").then(({ rows }) => {
//     console.log(rows);
// });
