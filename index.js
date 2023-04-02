import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { client } from "./config/database.js";

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import bcrypt from "bcryptjs";


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.path.startsWith("/login") || req.path.startsWith("/assets") || req.path.startsWith("/api/daftar") || req.path.startsWith("/api/login")) {
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
    `SELECT * FROM login where username='${req.body.username}'`
  );
  if (results.rows.length > 0) {
    if (await bcrypt.compare(req.body.password, results.rows[0].password)) {
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

app.post("/api/daftar", async (req, res) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(req.body.password, salt);
  await client.query(
    `INSERT INTO login(username,password) VALUES ('${req.body.username}','${hash}')`
  );
  res.send("akun berhasil daftar.");
});

app.listen(3000, () => {
  console.log("Server berhasil berjalan.");
});