<?php
session_start();
include_once('../conexao.php');

$retorno = ['status' => 'erro', 'mensagem' => 'Erro interno.'];

// Pegamos o ID do Admin que está logado (pela sessão)
$id_admin = $_SESSION['usuario']['id_usuario'] ?? null;

if (!$id_admin) {
    $retorno['mensagem'] = "Sessão de administrador inválida.";
    echo json_encode($retorno); exit;
}

$id_profissional = $_POST['id_usuario'] ?? 0;
$acao            = $_POST['status'] ?? ''; // 'Aprovado' ou 'Reprovado'
$motivo          = htmlspecialchars($_POST['motivo'] ?? '', ENT_QUOTES, 'UTF-8');

if ($id_profissional > 0 && ($acao == 'Aprovado' || $acao == 'Reprovado')) {
    
    $stmt = $conexao->prepare("UPDATE Documentacao 
                               SET status_aprovacao = ?, 
                                   motivo_reprovacao = ?, 
                                   id_admin_revisor = ?, 
                                   data_revisao = NOW() 
                               WHERE id_usuario = ?");
    
    $stmt->bind_param("ssii", $acao, $motivo, $id_admin, $id_profissional);
    
    if ($stmt->execute()) {
        $retorno = ['status' => 'sucesso', 'mensagem' => "Profissional $acao com sucesso!"];
    } else {
        $retorno['mensagem'] = "Erro ao atualizar banco de dados.";
    }
    $stmt->close();
}

header("Content-Type: application/json; charset=utf-8");
echo json_encode($retorno);
?>