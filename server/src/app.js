const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes= require("./routes/auth.routes.js");
const documentRoutes= require("./routes/document.routes.js");
const path = require("path");

const app= express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

app.get("/", (req, res) => {
    res.json({
        success:true,
        message:"Document Signature App Server is running"
    })
})

app.use("/api/auth", authRoutes);
app.use("/api/docs", documentRoutes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = app;