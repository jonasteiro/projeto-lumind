<?php
header('Content-Type: application/json; charset=utf-8');
include_once('conexao.php');
session_start();

// Validação de Sessão
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'ProfissionalSaude') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

// Aceitamos POST ou PUT, dependendo de como o Front-end for configurado
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido.']);
    exit;
}

$id_profissional = $_SESSION['usuario']['id_usuario'];
$dados = json_decode(file_get_contents('php://input'), true);

// Se o JSON falhar, tenta pegar via $_POST (caso o Front mande via formulário tradicional)
if (!$dados) {
    $dados = $_POST;
}

try {
    $conexao->begin_transaction();

    $id_atividade = $dados['id_atividade'];
    $titulo = $dados['titulo'];
    $descricao = $dados['descricao'];
    $categoria = $dados['categoria'];
    $pacientes_ids = $dados['pacientes_ids'];

    // Update com Trava de Segurança
    $sql_update = "UPDATE Atividade SET titulo = ?, descricao = ?, categoria = ? 
                   WHERE id_atividade = ? AND id_profissional = ?";
    $stmt = $conexao->prepare($sql_update);
    $stmt->bind_param("sssii", $titulo, $descricao, $categoria, $id_atividade, $id_profissional);
    $stmt->execute();
    $stmt->close();

    // Limpa a tabela pivô antiga
    $sql_delete_pivo = "DELETE FROM PessoaTea_Atividade WHERE id_atividade = ?";
    $stmt_del = $conexao->prepare($sql_delete_pivo);
    $stmt_del->bind_param("i", $id_atividade);
    $stmt_del->execute();
    $stmt_del->close();

    // Insere os novos pacientes
    $sql_pivo = "INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade) VALUES (?, ?)";
    $stmt_pivo = $conexao->prepare($sql_pivo);
    foreach ($pacientes_ids as $id_paciente) {
        $stmt_pivo->bind_param("ii", $id_paciente, $id_atividade);
        $stmt_pivo->execute();
    }
    $stmt_pivo->close();

    $conexao->commit();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade atualizada com sucesso!']);

} catch (Exception $e) {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao atualizar: ' . $e->getMessage()]);
}

$conexao->close();
?>