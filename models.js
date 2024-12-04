// models.js

const pool = require("./bd"); // Importa a conexão do bd.js

// Função para buscar um usuário no banco
const getUserByUsername = async (username) => {
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM users WHERE usuario = ?", [username]);

    if (rows.length === 0) {
      console.log(`Usuário ${username} não encontrado.`);
      return null;
    }

    return rows[0]; // Retorna o primeiro usuário encontrado
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    throw err; // Lança o erro para ser tratado em outro lugar
  }
};

// Exporta a função para ser utilizada em outros arquivos
module.exports = {
  getUserByUsername,
};
