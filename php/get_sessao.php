<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Verifica se a sessão do usuário existe no servidor
if (isset($_SESSION['usuario'])) {
    echo json_encode([
        'status' => 'ok',
        'nome' => $_SESSION['usuario']['nome'] // Pega o nome real do banco de dados
    ]);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Usuário não logado']);
}
?>