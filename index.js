var express = require("express");
var app = express();
exports.app = app;

const {
  requireSignature,
  requireNoSignature,
  requireLoggedOutUser
} = require("./middleware");

var {
  addSigner,
  getSigners,
  addUser,
  getSigImg,
  newProfile,
  getSignerFromCity,
  getAllUserData,
  updateProfile,
  getDataFromEmail,
  updateUsersTable,
  updateUsersTableWithPw,
  deleteSig
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

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/petition", requireNoSignature, (req, res) => {
  if (req.session.sigId) {
    res.redirect("/thanks");
  } else {
    res.render("petition", {
      layout: "main"
    });
  }
});

app.get("/register", requireLoggedOutUser, (req, res) => {
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
  if (!req.body.city && !req.body.url && !req.body.age && userUrl) {
    res.redirect("/petition");
  }
  if (
    userUrl.startsWith("http://") ||
    userUrl.startsWith("https://") ||
    userUrl.startsWith("//")
  ) {
    userUrl = req.body.homepage;
  } else {
    userUrl = "http://" + userUrl;
  }
  newProfile(req.body.age, req.body.city, userUrl, req.session.userId)
    .then(results => {
      console.log("results in post profile", results);
      res.redirect("/petition");
    })
    .catch(err => {
      console.log("err in post profile", err);
      res.render("profile", {
        layout: "main",
        errorMessage: "The web site has to starti with http:// or https://"
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
  let first = req.body.first;
  let last = req.body.second;
  let email = req.body.email;
  let password = req.body.password;
  let url = req.body.homepage;
  let age = req.body.age;
  let city = req.body.city;
  console.log("req.body.password", req.body.password);
  if (!password) {
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
          updateUsersTableWithPw(req.session.userId, first, last, email, hash);
        })
        .catch(err => console.log("err in profile edit post", err));
    });
    res.redirect("/thanks");
  }
});

app.get("/login", requireLoggedOutUser, (req, res) => {
  res.render("login", {
    layout: "main"
  });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
  getDataFromEmail(req.body.email)
    .then(results => {
      req.session.sigId = results.rows[0].id;
      if (results.rows[0].email == req.body.email) {
        compare(req.body.password, results.rows[0].password)
          .then(matchValue => {
            if (matchValue == true) {
              req.session.userId = results.rows[0].user_id;
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
      console.log("err in post login", err);
      res.render("login", {
        layout: "main",
        errorMessage: "wrong email or password"
      });
    });
});

app.get("/thanks", requireSignature, (req, res) => {
  let id = req.session.userId;
  getSigImg(id).then(results => {
    let nameAndSig = results.rows[0];
    res.render("thanks", {
      layout: "main",
      nameAndSig: nameAndSig
    });
  });
});

app.get("/signers", requireSignature, (req, res) => {
  getSigners().then(results => {
    let subscribers = results.rows;
    res.render("signers", {
      layout: "main",
      subscribers
    });
  });
});

app.get("/signers/:city", requireSignature, (req, res) => {
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
      res.redirect("/thanks");
    })
    .catch(err => console.log("error in post petition", err));
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("login");
});

app.get("/delete", (req, res) => {
  deleteSig(req.session.userId);
  req.session.sigId = null;
  res.redirect("/petition");
});

if (require.main === module) {
  app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server is listening")
  );
}
