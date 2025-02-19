import express, { Express } from "express";
import authRouter from "./routes/auth";
import cookieparser from "cookie-parser";
import usersRouter from "./routes/users";
import { errorHandler } from "./middlewares/errors";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import cors from "cors";

const app: Express = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

app.use(errorHandler);

export default app;