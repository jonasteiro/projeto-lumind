<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

if (!isset($_GET['id'])) {
    echo json_encode(['status' => 'erro', 'mensagem' => 'ID não informado.']);
    exit;
}

$id = (int) $_GET['id'];

$sql = "SELECT 
            status_aprovacao, 
            TO_BASE64(certificacao_profissional) as certificacao,
            TO_BASE64(carteira_identidade_nacional) as identidade
        FROM Documentacao 
        WHERE id_usuario = ?";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();

if ($res) {
    echo json_encode(['status' => 'ok', 'documento' => $res]);
} else {
    echo json_encode(['status' => 'erro', 'mensagem' => 'Nenhum documento encontrado no banco de dados.']);
}

$stmt->close();
$conexao->close();
?>