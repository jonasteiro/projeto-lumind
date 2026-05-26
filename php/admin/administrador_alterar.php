<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

$retorno = ['status' => 'nok', 'mensagem' => ''];
$id = isset($_POST['id_usuario']) ? intval($_POST['id_usuario']) : 0;

if ($id > 0) {
    $nome           = $_POST['nome'];
    $email          = $_POST['email'];
    $data_nascimento = $_POST['data_nascimento'];
    $senha          = !empty($_POST['senha']) ? password_hash($_POST['senha'], PASSWORD_DEFAULT) : null;
    $status_adm     = (int) $_POST['status_adm'];

    if ($senha) {
        $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, data_nascimento = ?, senha = ? WHERE id_usuario = ?");
        $stmt->bind_param("ssssi", $nome, $email, $data_nascimento, $senha, $id);
    } else {
        $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, data_nascimento = ? WHERE id_usuario = ?");
        $stmt->bind_param("sssi", $nome, $email, $data_nascimento, $id);
    }

    $stmt->execute();

    $stmt_adm = $conexao->prepare("UPDATE Administrador SET status_adm = ? WHERE id_usuario = ?");
    $stmt_adm->bind_param("ii", $status_adm, $id);
    $stmt_adm->execute();

    if (!$stmt->error && !$stmt_adm->error) {
        $retorno = ['status' => 'ok', 'mensagem' => 'Dados atualizados com sucesso!'];
    } else {
        $retorno['mensagem'] = 'Erro no banco: ' . $conexao->error;
    }

    $stmt->close();
    $stmt_adm->close();
} else {
    $retorno['mensagem'] = 'ID inválido ou não informado.';
}

$conexao->close();
echo json_encode($retorno);
exit;
?>