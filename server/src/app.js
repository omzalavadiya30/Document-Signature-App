const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes= require("./routes/auth.routes.js");
const documentRoutes= require("./routes/document.routes.js");
const signatureRoutes= require("./routes/signature.routes.js");
const auditRoutes= require("./routes/audit.routes.js");
const { auditMiddleware }= require("./middleware/audit.middleware.js");
const path = require("path");

const app= express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

// Global audit middleware - captures IP, user agent, etc.
app.use(auditMiddleware);

app.get("/", (req, res) => {
    res.json({
        success:true,
        message:"Document Signature App Server is running"
    })
})

app.use("/api/auth", authRoutes);
app.use("/api/docs", documentRoutes)
app.use("/api/signatures", signatureRoutes)
app.use("/api/audit", auditRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;