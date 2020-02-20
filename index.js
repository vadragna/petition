var express = require("express");
var app = express();
exports.app = app;

const bodyParser = require("body-parser");
const {
    requireSignature,
    requireNoSignatures,
    requireLoggedOutUser
} = require("./middleware");

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
    getAllUserData,
    updateProfileNoPassword,
    updateProfile,
    getDataFromEmail,
    updateUsersTable,
    updateUsersTableWithPw
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

//
app.use(function(req, res, next) {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
});

app.get("/welcome", (req, res) => {
    res.send("<h1>yes!</h1>");
});

app.post("/welcome", (req, res) => {
    req.session.submitted = true;
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    console.log("req.session", req.session);
    if (!req.session.submitted) {
        return res.redirect("/welcome");
    }
    res.send("<h1>home</h1>");
});

app.get("/", (req, res) => {
    // req.session.allspice = "OK";
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    console.log("req.session in get petition", req.session);
    if (req.session.sigId) {
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

app.post("/profile/edit", (req, res) => {
    console.log("req in /profile/edit in post /profile/edit", req.body);
    let first = req.body.first;
    let last = req.body.second;
    let email = req.body.email;
    let password = req.body.password;
    let url = req.body.homepage;
    let age = req.body.age;
    let city = req.body.city;
    console.log("req.body.password", req.body.password);
    if (!password) {
        console.log("no password to be updated");
        updateProfile(age, city, url, req.session.userId)
            .then(results => {
                console.log("results.rows in /profile/edit", results.rows);
                updateUsersTable(req.session.userId, first, last, email);
                res.redirect("/thanks");
            })
            .catch(err => console.log("err in profile edit post", err));
    } else {
        updateProfile(age, city, url, req.session.userId).then(() => {
            hash(req.body.password)
                .then(hash => {
                    console.log("hash", hash);
                    updateUsersTableWithPw(
                        req.session.userId,
                        first,
                        last,
                        email,
                        hash
                    );
                })
                .catch(err => console.log("err in profile edit post", err));
        });
        res.redirect("/thanks");
    }
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
    getDataFromEmail(req.body.email)
        .then(results => {
            if (results.rows[0].email == req.body.email) {
                console.log("results in post login", results);
                console.log("existing mail in db");
                // hash(req.body.password).then(hashedPw => {
                compare(req.body.password, results.rows[0].password)
                    .then(matchValue => {
                        console.log("match value: ", matchValue);
                        if (matchValue == true) {
                            req.session.userId = results.rows[0].id;
                            // console.log("boh", getUserId(req.body.email));
                            console.log("request.session", req.session);
                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                errorMessage: "wrong email or password"
                            });
                        }
                    })
                    .catch(err => console.log("err in post login", err));
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

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petition server is listening")
    );
}
