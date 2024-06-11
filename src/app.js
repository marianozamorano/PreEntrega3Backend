const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const app = express();
const PUERTO = 8080;
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const exphbs = require("express-handlebars");
const socket = require("socket.io");
require("./database.js");
const sessionsRouter = require("./routes/sessions.router.js");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const checkAuthorization = require("./authorizationMiddleware.js");

//Express-Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

//Middleware de Session:
app.use(session({
    secret: "secretCoder",
    resave: true,
    //Esta configuracion me permite mantener activa la sesion frente a la inactividad del usuario
    saveUninitialized: true,
    //Me permite guardar cualquier sesion aun cuando el objeto de sesion no tenga nada para contener

    // Utilizando Mongo Store
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://mjzamorano84:coderhouse@cluster0.enkrkrl.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0",
        ttl: 100
    })
}))

//Cambios con Passport:
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Aplicar checkAuthorization a las rutas de productos
app.use("/api/products", checkAuthorization, productsRouter);

//Rutas: 
app.use("/api/products", productsRouter);
app.use("/api/carts", checkAuthorization, cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);

const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto ${PUERTO}`);
})

const MessageModel = require("./models/message.model.js");
const io = new socket.Server(httpServer);


io.on("connection", (socket) => {
    console.log("Un cliente conectado");

    socket.on("message", async (data) => {
        
        //Guardo el mensaje en MongoDB: 
        await MessageModel.create(data);

        //Obtengo los mensajes de MongoDB y se los paso al cliente:
        const messages = await MessageModel.find();
        io.sockets.emit("message", messages)  
    })
} )