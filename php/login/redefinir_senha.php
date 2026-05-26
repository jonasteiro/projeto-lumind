<?php
if (ob_get_length()) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

$retorno = ['status' => 'nok', 'mensagem' => ''];
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$pin = isset($_POST['pin']) ? trim($_POST['pin']) : '';
$nova_senha = isset($_POST['nova_senha']) ? $_POST['nova_senha'] : '';

if(empty($email) || strlen($pin) !== 6 || strlen($nova_senha) < 6) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dados incompletos ou inválidos.']);
    exit;
}

$data_atual = date('Y-m-d H:i:s');
$stmt = $conexao->prepare("SELECT id_recuperacao FROM RecuperacaoSenha WHERE email = ? AND token = ? AND data_expiracao > ? ORDER BY id_recuperacao DESC LIMIT 1");
$stmt->bind_param("sss", $email, $pin, $data_atual);
$stmt->execute();
$res = $stmt->get_result();

if($res->num_rows > 0) {
    // CORREÇÃO CRÍTICA: Removido o password_hash(). A senha agora é salva em texto simples 
    // para não quebrar a lógica de validação nativa do seu script de login (usuario_login.php).
    $hash_senha = $nova_senha; 
    
    $stmt_update = $conexao->prepare("UPDATE Usuario SET senha = ? WHERE email = ?");
    $stmt_update->bind_param("ss", $hash_senha, $email);
    
    if($stmt_update->execute()) {
        $retorno['status'] = 'ok';
        $retorno['mensagem'] = 'Senha alterada com sucesso!';
        
        $stmt_delete = $conexao->prepare("DELETE FROM RecuperacaoSenha WHERE email = ?");
        $stmt_delete->bind_param("s", $email);
        $stmt_delete->execute();
        $stmt_delete->close();
    } else {
        $retorno['mensagem'] = 'Erro ao atualizar a senha no banco de dados.';
    }
    $stmt_update->close();
} else {
    $retorno['mensagem'] = 'Código inválido ou expirado. Solicite um novo.';
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
exit;
?>