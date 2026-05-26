<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

// Proteção Básica (Só Admin pode editar profissional)
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'Administrador') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido. Use POST.']);
    exit;
}

$id_usuario = intval($_POST['id_usuario']);
$nome = trim($_POST['nome']);
$email = trim($_POST['email']);
$cpf = trim($_POST['cpf']);
$data_nascimento = $_POST['data_nascimento'];
$senha = $_POST['senha']; 
$registro = trim($_POST['registro_profissional']);
$especialidade = $_POST['especialidade'];

if (empty($id_usuario) || empty($nome) || empty($email) || empty($cpf) || empty($registro)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Preencha todos os campos obrigatórios.']);
    exit;
}

try {
    $conexao->begin_transaction();

    // 1. Atualiza a tabela base (Usuario)
    if (!empty($senha)) {
        // Se preencheu a senha, atualiza a senha também
        // OBS: Recomendado usar password_hash() no futuro!
        $sql_user = "UPDATE Usuario SET nome=?, email=?, cpf=?, data_nascimento=?, senha=? WHERE id_usuario=?";
        $stmt = $conexao->prepare($sql_user);
        $stmt->bind_param("sssssi", $nome, $email, $cpf, $data_nascimento, $senha, $id_usuario);
    } else {
        // Se NÃO preencheu a senha, mantém a antiga
        $sql_user = "UPDATE Usuario SET nome=?, email=?, cpf=?, data_nascimento=? WHERE id_usuario=?";
        $stmt = $conexao->prepare($sql_user);
        $stmt->bind_param("ssssi", $nome, $email, $cpf, $data_nascimento, $id_usuario);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao atualizar dados base do usuário: " . $stmt->error);
    }
    $stmt->close();

    // 2. Atualiza a tabela específica (ProfissionalSaude)
    $sql_prof = "UPDATE ProfissionalSaude SET registro_profissional=?, especialidade=? WHERE id_usuario=?";
    $stmt2 = $conexao->prepare($sql_prof);
    $stmt2->bind_param("ssi", $registro, $especialidade, $id_usuario);
    
    if (!$stmt2->execute()) {
        throw new Exception("Erro ao atualizar dados profissionais: " . $stmt2->error);
    }
    $stmt2->close();

    $conexao->commit();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Dados do Profissional atualizados com sucesso!']);

} catch (Exception $e) {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => $e->getMessage()]);
}

$conexao->close();
?>