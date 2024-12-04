const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../../db"); // Ajuste o caminho para o arquivo de conexão ao banco de dados
const router = express.Router();

const verifyToken = (req, res, next) => {
  // Verifica se o token foi enviado
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token não fornecido" });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, "seu_segredo");
    req.user = decoded; // Salva o usuário decodificado para uso posterior
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
};

const verifyAdmin = (req, res, next) => {
  const userRole = req.user.role; // A role do usuário que foi decodificada do token

  if (userRole !== "admin") {
    return res.status(403).json({ message: "Acesso proibido" });
  }

  next();
};

module.exports = { verifyToken, verifyAdmin };
