import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

//__JSON functions_______________________________________________

function errorFormat_unauthorized(msg) {
    return {
        success: false,
        status: 401,
        message: "Unauthorized " + msg
    };
}

//__Middlewares__________________________________________________

export function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization; // ex: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(400).json(
                errorFormat_unauthorized("authorization header")
            );
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // user infos saved (ID)

        next();
    } catch (e) {
        console.error(e);s
        return res.status(401).json(
            errorFormat_unauthorized("token : invalid or expired.")
        );
    }
}
