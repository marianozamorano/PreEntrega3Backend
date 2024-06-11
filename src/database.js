//Acá vamos a realizar la conexión con MONGODB: 

//1) Instalamos mongoose: npm i mongoose

const mongoose = require("mongoose"); 

//2) Crear una conexión con la base de datos. 

mongoose.connect("mongodb+srv://mjzamorano84:coderhouse@cluster0.enkrkrl.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conexión exitosa"))
    .catch((error) => console.log("Error en la conexión", error))