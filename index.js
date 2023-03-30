import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./config/database.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.path.startsWith("/assets") || req.path.startsWith("/api")) {
    next();
  } else {
    if (req.cookies.token) {
      if (req.path.startsWith("/login")) {
        res.redirect("/");
      } else {
        next();
      }
    } else {
      if (req.path.startsWith("/login")) {
        next();
      } else {
        res.redirect("/login");
      }
    }
  }
});

app.use(express.static("public"));

app.post("/api/login", async (req, res) => {
  const results = await client.query(
    `SELECT * FROM users WHERE username = '${req.body.username}'`
  );
  if (results.rows.length > 0) {
    // if (await bcrypt.compare(req.body.password, results.rows[0].password)) {
      if(req.body.password === results.rows[0].password){
      const token = jwt.sign(results.rows[0], process.env.SECRET_KEY);
      res.cookie("token", token);
      res.send("Login berhasil.");
    } else {
      res.status(401);
      res.send("Kata sandi salah.");
    }
  } else {
    res.status(401);
    res.send("Admin tidak ditemukan.");
  }
});

app.listen(3000, () => {
  console.log("Server berhasil berjalan.");
});