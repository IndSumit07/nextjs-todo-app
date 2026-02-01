import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getDataFromToken = (request) => {
  try {
    const token = request.cookies.get("token")?.value || "";
    if (!token) return null;

    const decodedToken = jwt.verify(token, JWT_SECRET);
    return decodedToken.id;
  } catch (error) {
    return null;
  }
};
