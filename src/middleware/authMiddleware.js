const jwt = require('jsonwebtoken');


const authMiddleware = {
    protect: (req, res, next) => {
        try{
            const token = req.cookies?.jwtToken;
            if(!token){
                return res.status(401).json({ error: "Unauthorized access" });
            }
            try {
                const user = jwt.verify(token, process.env.JWT_SECRET);
                req.user = user;
                next();
            }
            catch (err) {
                return res.status(401).json({ error: "Unauthorized access" });
            }
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }       
    },
};

module.exports = authMiddleware;