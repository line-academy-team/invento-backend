import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT || "8080";

app.use(cors({ origin: ["http://localhost:8081"], credentials: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => console.log(`${PORT}번 포트에서 서버 실행.`));
