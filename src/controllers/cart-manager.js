const CartModel = require("../models/cart.model.js");
// const ProductModel = require("../models/product.model.js");
class CartManager {

    async crearCarrito() {
        try {
            const nuevoCarrito = new CartModel({ products: [] });
            await nuevoCarrito.save();
            return nuevoCarrito;
        } catch (error) {
            console.log("Error al crear el carrito", error)
            throw error;
        }
    }

    async getCarritoById(cartId) {
        try {
            const carrito = await CartModel.findById(cartId);

            if (!carrito) {
                throw new Error(`No existe un carrito con el id ${cartId}`);
            }

            return carrito;
        } catch (error) {
            console.error("Error al obtener el carrito por ID", error);
            throw error;
        }
    }

    async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const existeProducto = carrito.products.find(item => item.product.toString() === productId);

            if (existeProducto) {
                existeProducto.quantity += quantity;
            } else {
                carrito.products.push({ product: productId, quantity });
            }

            //Cuando modifican tienen que marcarlo como "markModified";
            carrito.markModified("products");

            await carrito.save();
            return carrito;
        } catch (error) {
            console.error("Error al agregar un producto", error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const carrito = await this.getCarritoById(cartId);
            carrito.products = carrito.products.filter(item => item.product.toString() !== productId);
            await carrito.save();
        } catch (error) {
            console.error("Error al eliminar un producto del carrito", error);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const productoIndex = carrito.products.findIndex(item => item.product.toString() === productId);
            if (productoIndex !== -1) {
                carrito.products[productoIndex].quantity = quantity;
                carrito.markModified("products");
                await carrito.save();
            }
        } catch (error) {
            console.error("Error al actualizar la cantidad de un producto en el carrito", error);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const carrito = await this.getCarritoById(cartId);
            carrito.products = [];
            await carrito.save();
        } catch (error) {
            console.error("Error al vaciar el carrito", error);
            throw error;
        }
    }

}


module.exports = CartManager;