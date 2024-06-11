// Middleware de autorización
const checkAuthorization = (req, res, next) => {
    // Verificar si el usuario está autenticado
    if (req.isAuthenticated()) {
        // Verificar si el usuario es administrador
        const userType = req.user.type;
        if (userType === "admin") {
            next();
        } else {
            res.status(403).json({ error: "Acceso no autorizado" });
        }
    } else {
        res.status(401).json({ error: "Usuario no autenticado" });
    }
};

module.exports = checkAuthorization;