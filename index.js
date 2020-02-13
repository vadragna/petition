var express = require("express");
var app = express();

const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

app.post("/", (req, res) => {
    console.log("post request");
    res.redirect("/thanks");
});

app.listen(8080, () => console.log("Petition server is listening"));
