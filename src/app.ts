import express, { Express } from "express";
import authRouter from "./routes/auth";
import cookieparser from "cookie-parser";
import usersRouter from "./routes/users";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.use('/auth', authRouter);

app.use('/users', usersRouter);

export default app;