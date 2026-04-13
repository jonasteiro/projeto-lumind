<?php
include_once('../conexao.php');

// Pega apenas o que o formulário enviou
$email = $_POST['email'] ?? '';
$cpf   = $_POST['cpf'] ?? '';

$retorno = ['status' => 'erro', 'mensagem' => 'Dados não encontrados.'];

if ($email && $cpf) {
    $stmt = $conexao->prepare("
        SELECT U.id_usuario, D.status_aprovacao, D.motivo_reprovacao 
        FROM Usuario U
        INNER JOIN Documentacao D ON U.id_usuario = D.id_usuario
        WHERE U.email = ? AND U.cpf = ?
    ");
    
    $stmt->bind_param("ss", $email, $cpf);
    $stmt->execute();
    
    $stmt->bind_result($id_usuario, $situacao, $motivo);
    
    if ($stmt->fetch()) {
        $retorno = [
            'status' => 'sucesso',
            'id_usuario' => $id_usuario,
            'situacao' => $situacao,
            'motivo' => $motivo
        ];
    }
    $stmt->close();
}

header("Content-Type: application/json");
echo json_encode($retorno);
?>