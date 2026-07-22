import jwt, { type JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: number;
}

// || "" 대신 그냥 환경변수를 가져옵니다.
const SECRET_KEY = process.env.JWT_SECRET;

// 환경변수가 누락되었을 때 서버 실행 즉시 알려주도록 방어 코드를 추가합니다.
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
