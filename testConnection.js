// testConnection.js
const pool = require("./db"); // Importe a configuração de conexão

// Função para testar a conexão
const testConnection = async () => {
  try {
    // Conectar-se ao banco de dados e fazer uma consulta
    pool.query("SELECT NOW()", (err, results) => {
      if (err) {
        console.error("Erro de conexão:", err);
        return;
      }

      console.log("Conectado ao MySQL com sucesso!");
      console.log("Resultado da consulta:", results);
    });
  } catch (err) {
    console.error("Erro de conexão:", err);
  }
};

// Executar o teste
testConnection();
