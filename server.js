const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { verifyToken } = require("./middlewares/auth");

const app = express();

// Configuração do CORS
app.use(
  cors({
    origin: "https://marcosnovais.com", // Frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: true,
  })
);

// Função verifyRole definida antes de usá-la
const verifyRole = (role) => {
  return (req, res, next) => {
    const decoded = jwt.verify(req.token, "seu_segredo");
    if (decoded.role !== role) {
      return res
        .status(403)
        .json({ message: "Você não tem permissão para acessar esta página." });
    }
    next();
  };
};

// Rota do Admin
app.get("/api/admin", verifyToken, verifyRole("admin"), (req, res) => {
  res.send("Página do Admin");
});

// Configuração do body-parser
app.use(bodyParser.json());

// Rota de login
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    console.log("Recebido no backend:", { usuario, senha });

    // Verifica se o usuário existe
    const [result] = await pool.query(
      "SELECT * FROM users WHERE usuario = ?",
      [usuario]
    );
    const user = result[0];

    if (!user) {
      console.log("Usuário não encontrado:", usuario);
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    // Verifica se a senha está correta
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      console.log("Senha incorreta para usuário:", usuario);
      return res.status(400).json({ message: "Senha incorreta" });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, "seu_segredo", {
      expiresIn: "1h",
    });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Erro no servidor:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// Rota de registro
app.post("/register", async (req, res) => {
  const { usuario, senha, role } = req.body; 

  if (!usuario || !senha || !role) { 
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    console.log("Verificando se o usuário já existe...");

    // Verifica se o usuário já existe no banco de dados
    const [userExists] = await pool.query(
      "SELECT * FROM users WHERE usuario = ?",
      [usuario]
    );

    if (userExists.length > 0) {
      return res.status(409).json({ error: "Usuário já existe." });
    }

    console.log("Codificando a senha...");

    // Codifica a senha antes de armazená-la no banco de dados
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    console.log("Inserindo o novo usuário no banco de dados...");

    // Insere o novo usuário no banco de dados com a senha codificada
    await pool.query(
      "INSERT INTO users (usuario, senha, role) VALUES (?, ?, ?)",
      [usuario, hashedPassword, role] 
    );

    console.log("Usuário registrado com sucesso");

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res
      .status(500)
      .json({ error: `Erro ao registrar usuário: ${err.message}` });
  }
});


const path = require("path");

// Servir arquivos estáticos do React (frontend)
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Inicia o servidor
app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
