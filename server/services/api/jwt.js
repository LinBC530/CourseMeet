import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET;

// 簽發 JWT token
export function sign_token(payload, expiresIn = "1d") {
  return jwt.sign(payload, SECRET_KEY, { algorithm: "HS256", expiresIn });
}

// 驗證 JWT token
export function verify_token(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error("令牌無效或過期");
  }
}

/**
 * 檢查 JWT 並驗證角色
 * @param {Array<string>} allowedRoles - 允許的角色陣列 [ 'user' | 'guest' ]
 */
export function authorizeRoles(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "未提供授權標頭" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verify_token(token);
      req.user = decoded; // 將解碼後的 payload 附加到 req 上

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "權限不足" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: error.message || "無效的令牌" });
    }
  };
}
