<?php
header('Content-Type: application/json; charset=utf-8');
include_once('conexao.php');
session_start();

// Validação de Sessão
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'ProfissionalSaude') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido.']);
    exit;
}

$id_profissional = $_SESSION['usuario']['id_usuario'];
$dados = json_decode(file_get_contents('php://input'), true);

if (!$dados) {
    $dados = $_POST;
}

try {
    $conexao->begin_transaction();

    $id_atividade = $dados['id_atividade'];

    // 1. Exclui da Tabela Pivô
    $sql_delete_pivo = "DELETE FROM PessoaTea_Atividade WHERE id_atividade = ?";
    $stmt_del_pivo = $conexao->prepare($sql_delete_pivo);
    $stmt_del_pivo->bind_param("i", $id_atividade);
    $stmt_del_pivo->execute();
    $stmt_del_pivo->close();

    // 2. Exclui a Atividade (Trava de Segurança)
    $sql_delete = "DELETE FROM Atividade WHERE id_atividade = ? AND id_profissional = ?";
    $stmt_del = $conexao->prepare($sql_delete);
    $stmt_del->bind_param("ii", $id_atividade, $id_profissional);
    $stmt_del->execute();

    if ($stmt_del->affected_rows === 0) {
        throw new Exception("Operação negada. A atividade não existe ou você não tem permissão para excluí-la.");
    }
    $stmt_del->close();

    $conexao->commit();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade excluída permanentemente.']);

} catch (Exception $e) {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => $e->getMessage()]);
}

$conexao->close();
?>