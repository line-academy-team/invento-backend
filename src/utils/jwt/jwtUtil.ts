import jwt, { type JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: number;
}

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error("환경 변수에 JWT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.");
}

const generateToken = (userId: number) => {
    return jwt.sign({ id: userId }, SECRET_KEY, {
        expiresIn: "1d",
    });
};

const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY) as DecodedToken;
};

export default {
    generateToken,
    verifyToken,
};
