const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    nombre: {
        type: String,
    },
    precio: {
        type: Number,
    },
    marca: {
        type: String,
    },
    descripcion: {
        type: String,
    },
    disponibilidad: {
        type: Boolean,
    }
})

const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;