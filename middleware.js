function requireLoggedOutUser(req, res, next) {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
}

function requireNoSignature(req, res, next) {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
}

//put in in thanks and signers as middleware route function
function requireSignature(req, res, next) {
    if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
}

exports.requireLoggedOutUser = requireLoggedOutUser;
exports.requireNoSignature = requireNoSignature;
exports.requireSignature = requireSignature;
