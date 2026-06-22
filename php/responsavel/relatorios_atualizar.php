<?php
session_start();
require_once('../conexao.php');

header('Content-Type: application/json');

$id_responsavel = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario   = $_SESSION['usuario']['tipo_usuario'] ?? null;

// Trava 1: Apenas ResponsavelLegal autenticado pode editar
if (!$id_responsavel || $tipo_usuario !== 'ResponsavelLegal') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

$id_relatorio = intval($_POST['id_relatorio'] ?? 0);
$descricao    = trim($_POST['descricao'] ?? '');

// Trava 2: Validações server-side (garante que o ID veio e a descrição tem tamanho aceitável)
if (!$id_relatorio || strlen($descricao) < 30) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dados inválidos ou descrição muito curta. Mínimo de 30 caracteres.']);
    exit;
}

// Trava 3 (Cenário 5 - Isolamento): Confirmar que o relatório EXISTE e PERTENCE a este responsável
$sql_check = "SELECT id_relatorio FROM Relatorio WHERE id_relatorio = ? AND id_responsavel = ?";
$stmt_check = $conexao->prepare($sql_check);
$stmt_check->bind_param("ii", $id_relatorio, $id_responsavel);
$stmt_check->execute();
if ($stmt_check->get_result()->num_rows === 0) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Relatório não encontrado ou você não tem permissão para editá-lo.']);
    $stmt_check->close();
    exit;
}
$stmt_check->close();

// Atualização no banco
// Não mudamos a data nem o dependente, apenas a descrição do relatório.
$sql = "UPDATE Relatorio SET descricao = ? WHERE id_relatorio = ? AND id_responsavel = ?";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("sii", $descricao, $id_relatorio, $id_responsavel);

if ($stmt->execute()) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Relatório atualizado com sucesso!']);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao atualizar. Tente novamente.']);
}

$stmt->close();
$conexao->close();
?>