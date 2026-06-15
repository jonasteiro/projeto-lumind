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
            id_relatorio, 
            data, 
            descricao,
            titulo_relatorio,   -- <-- VÍRGULA AQUI!
            recomendacoes_casa,
            data_proxima_avaliacao,
            duracao_minutos,
            progresso_percentual
        FROM Relatorio 
        WHERE id_responsavel = ?";

// r.numFloat, Colocar as variáveis seguido da  virgula, abaixo de "r.descricao,"
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