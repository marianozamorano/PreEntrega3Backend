const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//Me traigo el modelo y las funciones de bcrypt

const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashbcrypt.js");


//Importamos la estrategia de github:

const GitHubStrategy = require("passport-github2"); 

const initializePassport = () => {
    //Creamos la estrategia para el registro de usuarios
    passport.use("register", new LocalStrategy({
        //Le digo que quiero acceder al objeto request
        passReqToCallback: true,
        usernameField: "email",
        //Le digo que el campo para el usuario será el email
    }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        try {
            //Verificamos si ya existe un registro con ese email
            let user = await UserModel.findOne({ email });
            if (user) return done(null, false);

            //Sino existe, voy a crear un registro para el nuevo usuario:

            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            }
            //Lo guardamos en la DB:
            let result = await UserModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(error);
        }
    }))

    //Creamos la estrategia para el login de usuarios:

    passport.use("login", new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            //Primero verifico si existe un usuario con ese email
            const user = await UserModel.findOne({ email });
            if (!user) {
                console.log("Este usuario no existe");
                return done(null, false);
            }
            if (!isValidPassword(password, user)) return done(null, false);

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))

    //Serializar usuarios:

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser(async(id,done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    })

    //Aca trabajamos con la estrategia de github:

    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.335200a08b68ce5e",
        clientSecret: "40bcbbcf052bd8e2acb1e7ac0a1efd113b7f1546",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {
        //Una buena idea para chequear que todo funciona bien, es mostrar por consola el perfil:
        console.log("Perfil del usuario:", profile);
        try {
            let user = await UserModel.findOne({email:profile._json.email});
            if(!user){
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "Usuario",
                    age: 39,
                    email: profile._json.email,
                    password: "",
                }
                let result = await UserModel.create(newUser);
                done(null, result);
            }else{
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

module.exports = initializePassport;
