const bcrypt = require("bcryptjs");
const pool = require("./db"); // Importa sua conexão ao banco

(async () => {
  try {
    const result = await pool.query("SELECT id, senha FROM users");
    for (const user of result.rows) {
      const hashedPassword = await bcrypt.hash(user.senha, 10);
      await pool.query("UPDATE users SET senha = ? WHERE id = ?", [
        hashedPassword,
        user.id,
      ]);
    }
    console.log("Todas as senhas foram criptografadas com sucesso.");
  } catch (err) {
    console.error("Erro ao criptografar senhas:", err);
  } finally {
    pool.end(); // Fecha a conexão com o banco de dados
  }
})();
