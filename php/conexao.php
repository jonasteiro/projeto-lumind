<?php
// Variáveis de conexão com o Banco de Dados
$servidor = "localhost";
$porta = 3306;
$usuario  = "root";
$senha    = "shaine";
$nome_banco = "lumind_db";

$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco, $porta);
if ($conexao->connect_error) {
    error_log('MySQL Connect Error: ' . $conexao->connect_error);
    // Em APIs retornamos JSON quando apropriado; aqui apenas interrompemos o script
    die('Erro ao conectar ao banco de dados. Verifique os logs do servidor.');
}

// Compatibilidade: alguns scripts usam $mysqli em vez de $conexao
$mysqli = $conexao;
