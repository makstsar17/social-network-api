import express, { Express } from "express";
import authRouter from "./routes/auth";

const app: Express = express();

app.use(express.json());

app.use('/auth', authRouter);

export default app;