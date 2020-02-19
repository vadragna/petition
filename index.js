var express = require("express");
var app = express();
const bodyParser = require("body-parser");
// const db = require("./db.js");
// var { addSigner } = require("./db.js");
// var { getSigners } = require("./db.js");
// var { addUser } = require("./db.js");
// var { getEmail } = require("./db.js");
// var { getPassword } = require("./db.js");
var {
    addSigner,
    getSigners,
    addUser,
    getEmail,
    getUserId,
    getPassword,
    getSigId,
    getSigImg,
    newProfile,
    getSignerFromCity,
    getAllUserData
} = require("./db.js");
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
    // req.session.allspice = "OK";
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    const { sigId } = req.session;
    console.log("req.session in get petition", req.session);
    if (sigId) {
        res.redirect("/thanks");
    } else {
        // console.log("first, last, sig", first, last, sig);
        // db.addDetails(firstname, lastname, sig).then(response =>
        // req.session.sigId = response.rows[0].id)
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
    if (
        req.body.first &&
        req.body.second &&
        req.body.email &&
        req.body.password
    ) {
        hash(req.body.password).then(hash => {
            addUser(req.body.first, req.body.second, req.body.email, hash)
                .then(results => {
                    req.session.userId = results.rows[0].id;
                    req.session.first = results.rows[0].first;
                    req.session.last = results.rows[0].last;
                    req.session.email = results.rows[0].email;
                    // req.session.userId = results.rows[0].id;
                    res.redirect("/profile");
                })
                .catch(err => {
                    console.log("error in registration", err);
                });
        });
    } else {
        res.render("registration", {
            layout: "main",
            errorMessage: "you must fill out all fields to register"
        });
    }
});

app.get("/profile", (req, res) => {
    console.log("req.session in get profile", req.session);
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    var userUrl = req.body.homepage;
    console.log("userUrl", userUrl);
    if (!req.body.city && !req.body.url && !req.body.age && userUrl) {
        res.redirect("/petition");
    }
    if (userUrl.startsWith("http://") || userUrl.startsWith("https://")) {
        userUrl = req.body.homepage;
        console.log("req.body.homepage", req.body.homepage);
    } else {
        userUrl = null;
        console.log("url not valid");
    }

    newProfile(req.body.age, req.body.city, userUrl, req.session.userId)
        .then(results => {
            console.log("results in post profile", results);
            res.redirect("/petition");
        })
        .catch(err => {
            res.render("profile", {
                layout: "main",
                errorMessage: "The web site has to starti with http:// or"
            });
        });
});

app.get("/profile/edit", (req, res) => {
    getAllUserData(req.session.userId).then(results => {
        let allData = results.rows;
        res.render("edit", {
            layout: "main",
            allData
        });
    });
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
                        compare(
                            req.body.password,
                            results.rows[0].password
                        ).then(matchValue => {
                            console.log("match value: ", matchValue);
                            if (matchValue == true) {
                                req.session.userId = results.rows[0].id;
                                // console.log("boh", getUserId(req.body.email));
                                getUserId(req.body.email).then(results => {
                                    // let userId = results.rows[0].id;
                                    console.log(
                                        "req.session in login post",
                                        req.session
                                    );
                                });
                                console.log("request.session", req.session);
                                res.redirect("/petition");
                            } else {
                                res.render("login", {
                                    layout: "main",
                                    errorMessage: "wrong email or password"
                                });
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
            res.render("login", {
                layout: "main",
                errorMessage: "wrong email or password"
            });
        });
});

app.get("/thanks", (req, res) => {
    let id = req.session.userId;
    console.log("req.session in get thanks", req.session);
    getSigImg(id).then(results => {
        let nameAndSig = results.rows[0];
        res.render("thanks", {
            layout: "main",
            nameAndSig: nameAndSig
        });
    });
});

app.get("/signers", (req, res) => {
    getSigners().then(results => {
        let subscribers = results.rows;
        res.render("signers", {
            layout: "main",
            subscribers
        });
    });
});

app.get("/signers/:city", (req, res) => {
    console.log("req.params.city", req.params.city);
    getSignerFromCity(req.params.city).then(results => {
        let subscribers = results.rows;
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
    const { userId } = req.session;
    addSigner(req.body.sig, userId)
        .then(results => {
            req.session.sigId = results.rows[0].id;
            console.log("req session after post petition", req.session);
            // req.session.sigImg = req.body.sig;
            // console.log("req session in petition", req.session);
            // getSigId(req.body.sig, userId).then(results => {
            //     req.session.sigId = results.rows[0].id;
            //     console.log("req.session in post petition", req.session);
            // });
            // console.log("row in post petition", row);
            // console.log("req session in post petition", req.session);
            // var id = row.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => console.log("error in post petition", err));
    // res.sendStatus("500");
});

app.get("/logout", (req, res) => {
    res.session = null;
    res.redirect("login");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server is listening")
);
