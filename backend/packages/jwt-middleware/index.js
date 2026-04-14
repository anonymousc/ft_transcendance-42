const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message:
          'Authorization header with Bearer token or access_token cookie is required',
      },
    });
  }

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    console.error('[auth] JWT_ACCESS_SECRET is not set');
    return res.status(500).json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Server misconfiguration' },
    });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      ok: false,
      error: {
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: isExpired
          ? 'Access token has expired'
          : 'Invalid access token',
      },
    });
  }
}

module.exports = authMiddleware;
