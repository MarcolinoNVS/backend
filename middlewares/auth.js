const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const db = require('../db');
const router = express.Router();

// Função para verificar o token
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

// Função para verificar se o usuário tem a role de "admin"
const verifyAdmin = (req, res, next) => {
  const userRole = req.user.role; // A role do usuário que foi decodificada do token

  if (userRole !== "admin") {
    return res.status(403).json({ message: "Acesso proibido" });
  }

  next();
};

// Função para criar o token JWT com nome e role
const generateToken = (user) => {
  const payload = {
    id: user.id,
    name: user.nome,   // Nome do usuário recuperado do banco de dados
    role: user.role    // Role do usuário recuperado do banco de dados
  };

  // Gerar o token JWT
  return jwt.sign(payload, "seu_segredo", { expiresIn: "1h" });
};

// Rota de login (exemplo)
router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    // Procura o usuário no banco de dados
    const user = await db.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(senha, user.rows[0].senha);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Criação do token JWT
    const token = generateToken(user.rows[0]);

    // Envia o token de volta para o frontend
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = { verifyToken, verifyAdmin };
