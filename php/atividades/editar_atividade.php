<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'ProfissionalSaude') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido.']);
    exit;
}

$id_profissional = $_SESSION['usuario']['id_usuario'];
$id_atividade = (int)$_POST['id_atividade'];
$titulo = $_POST['titulo'];
$descricao = $_POST['descricao'];
$categoria = $_POST['categoria'];
$data_publicacao = $_POST['data_publicacao'];
$pacientes_ids = $_POST['pacientes_ids'] ?? [];
$manter_arquivo = $_POST['manter_arquivo'] === "true"; 

if ($id_atividade <= 0 || empty($titulo) || empty($pacientes_ids)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Preencha os campos obrigatórios.']);
    exit;
}

// 👇 NOVA TRAVA DE SEGURANÇA: Impede alteração no banco se o paciente já respondeu
$checkRespostas = $conexao->prepare("
    SELECT id_pessoa_tea 
    FROM PessoaTea_Atividade 
    WHERE id_atividade = ? AND status_conclusao IN ('Concluída', 'Avaliada') 
    LIMIT 1
");
$checkRespostas->bind_param("i", $id_atividade);
$checkRespostas->execute();
if ($checkRespostas->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Ação bloqueada: Esta atividade já possui respostas e não pode ser editada.']);
    $checkRespostas->close();
    $conexao->close();
    exit;
}
$checkRespostas->close();
// 👆 FIM DA TRAVA

try {
    $conexao->begin_transaction();

    // 1. Atualiza Dados Básicos e Arquivo Anexo
    if (isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK) {
        $arquivo_binario = file_get_contents($_FILES['arquivo']['tmp_name']);
        $tipo_arquivo = $_FILES['arquivo']['type'];
        
        $sql = "UPDATE Atividade SET titulo=?, descricao=?, categoria=?, data_publicacao=?, arquivo_anexo=?, tipo_arquivo=? WHERE id_atividade=? AND id_profissional=?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ssssssii", $titulo, $descricao, $categoria, $data_publicacao, $arquivo_binario, $tipo_arquivo, $id_atividade, $id_profissional);
    } 
    else if (!$manter_arquivo) {
        // Se apagou o arquivo pelo X
        $sql = "UPDATE Atividade SET titulo=?, descricao=?, categoria=?, data_publicacao=?, arquivo_anexo=NULL, tipo_arquivo=NULL WHERE id_atividade=? AND id_profissional=?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ssssii", $titulo, $descricao, $categoria, $data_publicacao, $id_atividade, $id_profissional);
    } 
    else {
        // Se não enviou arquivo novo e quer manter o antigo
        $sql = "UPDATE Atividade SET titulo=?, descricao=?, categoria=?, data_publicacao=? WHERE id_atividade=? AND id_profissional=?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("ssssii", $titulo, $descricao, $categoria, $data_publicacao, $id_atividade, $id_profissional);
    }
    
    $stmt->execute();
    $stmt->close();

    // 2. Atualiza a lista de pacientes (Remove os que não estão na nova lista e adiciona os novos)
    // Primeiro, apaga vínculos desmarcados (mas NÃO apaga se já estiver concluído para não perder histórico)
    $ids_string = implode(",", array_map('intval', $pacientes_ids));
    $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_atividade = $id_atividade AND status_conclusao != 'Concluída' AND status_conclusao != 'Avaliada' AND id_pessoa_tea NOT IN ($ids_string)");

    // Adiciona novos vínculos
    $stmt_pivo = $conexao->prepare("INSERT IGNORE INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade) VALUES (?, ?)");
    foreach ($pacientes_ids as $id_paciente) {
        $stmt_pivo->bind_param("ii", $id_paciente, $id_atividade);
        $stmt_pivo->execute();
    }
    $stmt_pivo->close();

    $conexao->commit();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade atualizada.']);

} catch (Exception $e) {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro: ' . $e->getMessage()]);
}

$conexao->close();
?>