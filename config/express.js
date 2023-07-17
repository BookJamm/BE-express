import express from "express";
import cors from "cors";
import { response } from "./response";
import baseResponse from "./baseResponeStatus";
import recordsRouter from "../src/records/recordsRouter";
import placesRouter from "../src/places/placesRouter";
import reviewsRouter from "../src/reviews/reviewsRouter";
import authRouter from "../src/auth/authRouter";
import userRouter from "../src/user/userRouter";
import activityRouter from "../src/Activity/activityRouter";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.status(200).send(response(baseResponse.SUCCESS, "Hello World!")));

app.use("/places", placesRouter);
app.use("/records", recordsRouter);
app.use("/reviews", reviewsRouter);
app.use("/activities", activityRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

export default app;
