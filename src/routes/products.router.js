const express = require("express");
const router = express.Router();
const UserModel = require("../models/user.model.js");
const ProductManager = require("../controllers/product-manager.js");
const productManager = new ProductManager();
//Aca le vamos a sacar el path, porque ya no tenemos un json local.
const checkAuthorization = require("../authorizationMiddleware.js"); // Importa el middleware


// 1) Listar todos los productos. 
router.get("/", async (req, res) => {
    try {
        // Parámetros de consulta
        const { limit = 10, page = 1, sort } = req.query;

        // Convertir el límite y la página a números enteros
        const limitInt = parseInt(limit);
        const pageInt = parseInt(page);

        // Obtener productos según los parámetros de consulta
        const productos = await productManager.getProducts({ limit: limitInt, page: pageInt, sort:sort });

        // Calculando información de paginación
        const totalCount = await productManager.getProductCount(); // Obtener el total de productos
        const totalPages = Math.ceil(totalCount / limitInt);
        const hasPrevPage = pageInt > 1;
        const hasNextPage = pageInt < totalPages;

        // Construir objeto de respuesta
        const response = {
            status: "success",
            payload: productos,
            totalPages: totalPages,
            prevPage: hasPrevPage ? pageInt - 1 : null,
            nextPage: hasNextPage ? pageInt + 1 : null,
            page: pageInt,
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevLink: hasPrevPage ? `/api/products?limit=${limitInt}&page=${pageInt - 1}&sort=${sort}` : null,
            nextLink: hasNextPage ? `/api/products?limit=${limitInt}&page=${pageInt + 1}&sort=${sort}` : null
        };

        //Recuperamos los docs:

        const productosFinal = productos.map(producto => {
            const {__id, ...rest} = producto.toObject();
            return rest;
        })
        
        // Obtener el usuario de la sesión
        const user = req.session.user;

        res.render('index', {
            productos: productosFinal,
            user: user,
            prevLink: response.prevLink,
            nextLink: response.nextLink,
            page: response.page,
            totalPages: response.totalPages
        });
        
        // res.json(response);
    } catch (error) {
        console.error("Error al obtener productos", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});



//2) Traer solo un producto por id: 

router.get("/:pid", async (req, res) => {
    const id = req.params.pid;

    try {
        const producto = await productManager.getProductById(id);
        if (!producto) {
            return res.json({
                error: "Producto no encontrado"
            });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// 3) Agregar nuevo producto: 
router.post("/", checkAuthorization, async (req, res) => {
    // Verificar si el usuario tiene el rol de administrador
    if (req.user && req.user.role === "admin") {
        try {
            // Implementación para agregar un nuevo producto
            const nuevoProducto = req.body;

            // Lógica para agregar el nuevo producto a la base de datos
            await productManager.addProduct(nuevoProducto);

            // Respuesta con mensaje de éxito
            res.status(201).json({
                message: "Producto agregado exitosamente"
            });
        } catch (error) {
            console.error("Error al agregar producto", error);
            res.status(500).json({
                error: "Error interno del servidor"
            });
        }
    } else {
        // Si el usuario no tiene permisos de administrador, devolver un mensaje de error
        res.status(403).json({
            error: "Acceso no autorizado"
        });
    }
});


// 4) Actualizar producto por ID (protegido con checkAuthorization)
router.put("/:pid", checkAuthorization, async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const id = req.params.pid;
        const productoActualizado = req.body;
        try {
            await productManager.updateProduct(id, productoActualizado);
            res.json({ message: "Producto actualizado exitosamente" });
        } catch (error) {
            console.error("Error al actualizar producto", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
});
// 5) Eliminar producto (protegido con checkAuthorization)
router.delete("/:pid", checkAuthorization, async (req, res) => {
    if (req.user && req.user.role === "admin") {
        const id = req.params.pid;
        try {
            await productManager.deleteProduct(id);
            res.json({ message: "Producto eliminado exitosamente" });
        } catch (error) {
            console.error("Error al eliminar producto", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    } else {
        res.status(403).json({ error: "Acceso no autorizado" });
    }
});

module.exports = router;