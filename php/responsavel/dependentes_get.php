<?php
session_start();
require_once('../conexao.php');

$id_responsavel = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario   = $_SESSION['usuario']['tipo_usuario'] ?? null;

// Trava de segurança dupla: sessão válida E perfil correto
if (!$id_responsavel || $tipo_usuario !== 'ResponsavelLegal') {
    header('Content-Type: application/json');
    echo json_encode([]);
    exit;
}

// Busca APENAS os dependentes vinculados a este responsável (Cenário 1 - Segregação)
$sql = "SELECT pt.id_usuario AS id_pessoa_tea, u.nome
        FROM PessoaTea pt
        INNER JOIN Usuario u ON pt.id_usuario = u.id_usuario
        WHERE pt.id_responsavel = ?
        ORDER BY u.nome ASC";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id_responsavel);
$stmt->execute();
$resultado = $stmt->get_result();

$dependentes = [];
while ($row = $resultado->fetch_assoc()) {
    $dependentes[] = $row;
}

$stmt->close();
$conexao->close();

header('Content-Type: application/json');
echo json_encode($dependentes, JSON_UNESCAPED_UNICODE);
?>