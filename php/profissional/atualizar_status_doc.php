<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Método inválido. Use POST.']);
    exit;
}

$id = (int) $_POST['id'];
$status = $_POST['status'];
$motivo = isset($_POST['motivo']) ? $_POST['motivo'] : null;

$sql = "UPDATE Documentacao 
        SET status_aprovacao = ?, 
            motivo_reprovacao = ?, 
            data_revisao = NOW() 
        WHERE id_usuario = ?";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("ssi", $status, $motivo, $id);

if ($stmt->execute()) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Avaliação salva com sucesso!']);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro interno ao salvar no banco de dados: ' . $conexao->error]);
}

$stmt->close();
$conexao->close();
?>