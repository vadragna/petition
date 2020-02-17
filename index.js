var express = require("express");
var app = express();
const bodyParser = require("body-parser");
const db = require("./db.js");
var { addSigner } = require("./db.js");
var { getSigners } = require("./db.js");
var { addUser } = require("./db.js");
var { getEmail } = require("./db.js");
var { getPassword } = require("./db.js");
var { getUserId } = require("./db.js");
const { hash, compare } = require("./utils/bc.js");

const cookieSession = require("cookie-session");
const csurf = require("csurf");

const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extendend: false
    })
);

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get("/", (req, res) => {
    req.session.allspice = "OK";
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    console.log("req.session in petition", req.session);
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        // console.log("first, last, sig", first, last, sig);
        // db.addDetails(firstname, lastname, sig).then(response =>
        // req.session.sigId = response.rows[0].id)
        console.log("req.session in /petition", req.session);
        res.render("petition", {
            layout: "main"
        });
    }
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    //grap user's password req.body.password(dipende dal node dell'input field)
    //hash user PW and store to database
    hash(req.body.password)
        .then(hash => {
            addUser(req.body.first, req.body.second, req.body.email, hash).then(
                results => {
                    let users = results;
                    console.log("let users (results)", users);
                    res.redirect("petition");
                }
            );
        })
        .catch(err => console.log("err in registration", err));
    console.log("user input password", req.body.password);
    // hash(req.body.password).then(hashedPw => {
    //     console.log("hashed PW from /register", hashedPw);
    //store in in the bd table
    //redirect to somewhere else (first page)
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
    //compare two arguments hashed PW retrived from database and the typed in password.
    //if they match returns true otherwise false. The e-mail will be the id (in WHERE statement)
    // const hashFromDb = "test"; //questo deve essere preso dal bd
    // compare("userInput", hashFromDb).then(matchValue => {
    //     console.log("matchValue of compare: ", matchValue);
    // });
    //if the match redirect to petition, set somthing in req.session.userId, if they do not match,
    //trigger or send error message
});

app.post("/login", (req, res) => {
    console.log("req.body.email", req.body.email);
    getEmail(req.body.email)
        .then(results => {
            if (results.rows[0].email == req.body.email) {
                // compare(req.body.password, )
                console.log("existing mail in db");
                getPassword(req.body.password, req.body.email).then(results => {
                    hash(req.body.password).then(hashedPw => {
                        console.log(
                            "hashedPw",
                            hashedPw,
                            "results.rows[0].password",
                            results.rows[0].password
                        );
                        compare(
                            req.body.password,
                            results.rows[0].password
                        ).then(matchValue => {
                            console.log("match value: ", matchValue);
                            if (matchValue == true) {
                                // console.log("boh", getUserId(req.body.email));
                                getUserId(req.body.email).then(results => {
                                    // let userId = results.rows[0].id;
                                    req.session.userId = results.rows[0].id;
                                    console.log(
                                        "req.session.userId",
                                        req.session.userId
                                    );
                                });
                                res.redirect("/petition");
                            } else {
                                console.log("NO WAY!!");
                            }
                        });
                        // if (compare(hashedPw, results.rows[0].password)) {
                        //     console.log("you can log in!");
                        // } else {
                        //     console.log("no way");
                        // }
                    });
                });
            }
        })
        .catch(err => {
            console.log("no existing mail in db");
            res.redirect("/login");
        });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

app.get("/signers", (req, res) => {
    getSigners().then(results => {
        let subscribers = results.rows;
        console.log("results.rows", results.rows);
        res.render("signers", {
            layout: "main",
            subscribers
        });
    });
});

app.post("/thanks", (req, res) => {
    res.redirect("/signers");
});

app.post("/petition", (req, res) => {
    console.log(
        "userId in petition",
        req.session.sigId,
        req.session,
        "req.session"
    );
    addSigner(req.body.sig, req.session.sigId)
        .then(row => {
            req.session.sigId = row.rows[0].id;
            var id = row.rows[0].id;
            console.log("req.session.sig", id);
            res.redirect("/thanks");
        })
        .catch(err => console.log("error in post petition", err));
    // res.sendStatus("500");
});

app.listen(8080, () => console.log("Petition server is listening"));
