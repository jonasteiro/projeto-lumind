<?php
include_once('../conexao.php');

$email = $_POST['email'] ?? '';
$cpf   = $_POST['cpf'] ?? '';

$retorno = ['status' => 'erro', 'mensagem' => 'Dados não encontrados.'];

if ($email && $cpf) {
    // SQL que junta Usuario e Documentacao
    $stmt = $conexao->prepare("
        SELECT D.status_aprovacao, D.motivo_reprovacao 
        FROM Usuario U
        INNER JOIN Documentacao D ON U.id_usuario = D.id_usuario
        WHERE U.email = ? AND U.cpf = ?
    ");
    
    $stmt->bind_param("ss", $email, $cpf);
    $stmt->execute();
    $stmt->bind_result($situacao, $motivo);
    
    if ($stmt->fetch()) {
        $retorno = [
            'status' => 'sucesso',
            'situacao' => $situacao,
            'motivo' => $motivo
        ];
    }
    $stmt->close();
}

header("Content-Type: application/json");
echo json_encode($retorno);
?>