const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/cart-manager.js");
const cartManager = new CartManager();
//Eliminamos el path de la instancia de CartManager. 


//1) Creamos un nuevo carrito: 

router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await cartManager.crearCarrito();
        res.json(nuevoCarrito);
    } catch (error) {
        console.error("Error al crear un nuevo carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

//2) Listamos los productos que pertenecen a determinado carrito. 

router.get("/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await cartManager.getCarritoById(cartId);
        res.json(carrito.products);
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


//3) Agregar productos a distintos carritos.

router.post("/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        

        const actualizarCarrito = await cartManager.agregarProductoAlCarrito(cartId, productId, quantity);
        res.json(actualizarCarrito.products);
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// DELETE para eliminar un producto del carrito
router.delete("/:cartId/products/:productId", async (req, res) => {
    const cartId = req.params.cartId;
    const productId = req.params.productId;

    try {
        await cartManager.removeProductFromCart(cartId, productId);
        res.json({
            message: "Producto eliminado del carrito exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar producto del carrito", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// PUT para actualizar la cantidad de un producto en el carrito
router.put("/:cartId/products/:productId", async (req, res) => {
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const { quantity } = req.body;

    try {
        await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.json({
            message: "Cantidad de producto actualizada en el carrito exitosamente"
        });
    } catch (error) {
        console.error("Error al actualizar cantidad de producto en el carrito", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// DELETE para vaciar completamente un carrito
router.delete("/:cartId", async (req, res) => {
    const cartId = req.params.cartId;

    try {
        await cartManager.clearCart(cartId);
        res.json({
            message: "Carrito vaciado exitosamente"
        });
    } catch (error) {
        console.error("Error al vaciar el carrito", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});


router.post("/add-to-cart/:productId", async (req, res) => {
    const productId = req.params.productId;
    const quantity = req.body.quantity || 1;

    try {
        
        const carrito = await cartManager.crearCarrito();
        console.log("Se creó un nuevo carrito:", carrito._id);
        
        // Llama a la función para agregar producto al carrito del CartManager
        const result = await cartManager.agregarProductoAlCarrito(carrito._id, productId, quantity);
        res.json(result);
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/view-cart/:cartId", async (req, res) => {
    const cartId = req.params.cartId;

    try {
        const carrito = await cartManager.getCarritoById(cartId);
        res.render("cart", { carrito });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;