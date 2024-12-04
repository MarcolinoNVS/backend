require('dotenv').config(); // Para carregar as variáveis do .env localmente
const mysql = require('mysql2/promise'); // Utilize o driver mysql2 para suporte a Promises

// Criação de conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Porta padrão do MySQL
  waitForConnections: true,
  connectionLimit: 10, // Limite de conexões no pool
  queueLimit: 0, // Sem limite na fila
});

module.exports = pool;
