<?php
session_start();
require_once('../conexao.php');

header('Content-Type: application/json');

$id_responsavel = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario   = $_SESSION['usuario']['tipo_usuario'] ?? null;

if (!$id_responsavel || $tipo_usuario !== 'ResponsavelLegal') {
    echo json_encode([]);
    exit;
}

// Busca todos os relatórios deste responsável, trazendo o nome do dependente
$sql = "SELECT 
            r.id_relatorio,
            r.data,
            r.descricao,
            u.nome AS nome_dependente
        FROM Relatorio r
        INNER JOIN Usuario u ON r.id_pessoa_tea = u.id_usuario
        WHERE r.id_responsavel = ?
        ORDER BY r.data DESC";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id_responsavel);
$stmt->execute();
$resultado = $stmt->get_result();

$relatorios = [];
while ($row = $resultado->fetch_assoc()) {
    $relatorios[] = $row;
}

$stmt->close();
$conexao->close();

echo json_encode($relatorios, JSON_UNESCAPED_UNICODE);
?>