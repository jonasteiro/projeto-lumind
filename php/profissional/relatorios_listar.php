<?php
session_start();
require_once('../conexao.php');

header('Content-Type: application/json');

$id_profissional = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario    = $_SESSION['usuario']['tipo_usuario'] ?? null;

// Trava de segurança: apenas ProfissionalSaude autenticado
if (!$id_profissional || $tipo_usuario !== 'ProfissionalSaude') {
    echo json_encode([]);
    exit;
}

// Busca todos os relatórios dos pacientes vinculados a este profissional.
// Isolamento garantido: o JOIN com PessoaTea filtra por id_profissional = ?,
// impedindo que relatórios de pacientes de outros profissionais apareçam.
$sql = "SELECT
            r.id_relatorio,
            r.data,
            r.descricao,
            u_paciente.nome    AS nome_paciente,
            u_resp.nome        AS nome_responsavel
        FROM Relatorio r
        INNER JOIN PessoaTea    pt         ON r.id_pessoa_tea   = pt.id_usuario
        INNER JOIN Usuario      u_paciente ON pt.id_usuario     = u_paciente.id_usuario
        INNER JOIN Usuario      u_resp     ON r.id_responsavel  = u_resp.id_usuario
        WHERE pt.id_profissional = ?
        ORDER BY r.data DESC";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id_profissional);
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