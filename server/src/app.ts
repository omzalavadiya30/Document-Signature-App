import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app= express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

app.get("/", (req, res) => {
    res.json({
        success:true,
        message:"Document Signature App Server is running"
    })
})

export default app;