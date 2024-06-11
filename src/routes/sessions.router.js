const express = require("express");
const router = express.Router();
// const UserModel = require("../models/user.model.js");
const passport = require("passport");

// Registro con passport:

router.post("/", passport.authenticate("register", {
    failureRedirect: "/api/sessions/failedregister"
}), async (req, res) => {

    if (!req.user) return res.status(400).send("Credenciales inválidas");

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    req.session.login = true;
    res.redirect("/profile");
})

router.get("/failedregister", (req, res) => {
    res.send("Registro fallido")
})

// Login con passport

router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/faillogin" }), async (req, res) => {
    if (!req.user) return res.status(400).send("Credenciales inválidas");

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email
    };
    req.session.login = true;
    res.redirect("/profile");
})

router.get("/faillogin", (req, res) => {
    res.send("Fallo el login");
})

//Logout

router.get("/logout", (req, res) => {
    if(req.session.login){
        req.session.destroy();
    }
    res.redirect("/login");
})

//Version para GitHub

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async (req, res) => {

})

router.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/login"}), async (req, res) => {
    //La estrategia de GitHub nos retornará el usuario, entonces lo agregamos a nuestro objeto de session:
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/profile");
})

// Obtener información del usuario actual
router.get("/current", (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (req.session.user) {
        // Si hay un usuario, enviar un DTO con información básica
        const { first_name, last_name, email } = req.session.user;
        const userDTO = { first_name, last_name, email };
        res.json(userDTO);
    } else {
        // Si no hay un usuario en la sesión, enviar un mensaje de error
        res.status(401).json({ error: "No hay usuario autenticado" });
    }
});

module.exports = router;