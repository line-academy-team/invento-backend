import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRouter from "./routes/userRouter.ts";
import adminRouter from "./routes/admin/adminRouter.ts";
import organizationRouter from "./routes/organizationRouter.ts";
import rentalRouter from "./routes/rentalRouter.ts";
import stockRouter from "./routes/stockRouter.ts";
import reportRouter from "./routes/reportRouter.ts";

dotenv.config();

const app = express();

const PORT = process.env.PORT || "8080";

app.use(cors({ origin: ["http://localhost:8081"], credentials: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/user", userRouter);
app.use("/organization", organizationRouter);
app.use("/rental", rentalRouter);
app.use("/stock", stockRouter);
app.use("/report", rentalRouter);
app.use("/report", reportRouter);

app.use("/admin", adminRouter);

app.listen(PORT, () => console.log(`${PORT}번 포트에서 서버 실행.`));
