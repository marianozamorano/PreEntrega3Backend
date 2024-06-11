const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    res.render("chat");
})

router.get("/register", (req, res) => {
    if(req.session.login){
        return res.redirect("/profile");
    }
    res.render("register");
})

router.get("/login", (req, res) => {
    res.render("login");
})

router.get("/profile", (req, res) => {
    if(!req.session.login){
        return res.redirect("/login");
    }
    res.render("profile", {user: req.session.user});
})

router.get("/products", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }
    res.render("products", { user: req.session.user });
});

router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
});

module.exports = router;