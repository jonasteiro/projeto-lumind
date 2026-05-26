<?php
if (ob_get_length()) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

$retorno = ['status' => 'nok', 'mensagem' => ''];
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if(empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'E-mail inválido.']);
    exit;
}

// Verifica se o usuário existe
$stmt = $conexao->prepare("SELECT id_usuario FROM Usuario WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if($res->num_rows > 0) {
    // Gera PIN de 6 dígitos e data de validade (+30 minutos)
    $pin = sprintf("%06d", mt_rand(1, 999999));
    $data_expiracao = date('Y-m-d H:i:s', strtotime('+30 minutes'));

    // Salva no banco
    $stmt_insert = $conexao->prepare("INSERT INTO RecuperacaoSenha (email, token, data_expiracao) VALUES (?, ?, ?)");
    $stmt_insert->bind_param("sss", $email, $pin, $data_expiracao);
    
    if($stmt_insert->execute()) {
        $retorno['status'] = 'ok';
        $retorno['mensagem'] = 'Instruções enviadas.';
        // PARA TESTES: Retornando o PIN para você ver na tela. Em produção, apague esta linha e implemente PHPMailer.
        $retorno['pin_teste'] = $pin; 
    } else {
        $retorno['mensagem'] = 'Erro ao gerar código de segurança.';
    }
    $stmt_insert->close();
} else {
    // Por segurança, não informamos que o e-mail não existe (Prevenção contra enumeração de usuários)
    $retorno['mensagem'] = 'Se o e-mail estiver cadastrado, o código foi enviado.';
}

$stmt->close();
$conexao->close();
echo json_encode($retorno);
exit;
?>