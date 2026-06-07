<?php
session_start();
require_once('../conexao.php');

header('Content-Type: application/json');

$id_responsavel = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario   = $_SESSION['usuario']['tipo_usuario'] ?? null;

// Trava 1: Apenas ResponsavelLegal autenticado pode salvar
if (!$id_responsavel || $tipo_usuario !== 'ResponsavelLegal') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

$id_pessoa_tea = intval($_POST['id_pessoa_tea'] ?? 0);
$data_evento   = $_POST['data_evento'] ?? '';
$descricao     = trim($_POST['descricao'] ?? '');
//++Criar variável no PHP que pega do JS (não esquece o nome)
//$numFloat      = $_POST['numFloat'] ?? '';


// Trava 2: Validações server-side (espelham o frontend)
if (!$id_pessoa_tea || !$data_evento || strlen($descricao) < 30) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dados inválidos ou descrição muito curta.']);
    exit;
}

// Trava 3 (Cenário 5 - Isolamento): Confirmar que o dependente pertence a este responsável
$sql_check = "SELECT id_usuario FROM PessoaTea WHERE id_usuario = ? AND id_responsavel = ?";
$stmt_check = $conexao->prepare($sql_check);
$stmt_check->bind_param("ii", $id_pessoa_tea, $id_responsavel);
$stmt_check->execute();
if ($stmt_check->get_result()->num_rows === 0) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dependente não encontrado para este responsável.']);
    $stmt_check->close();
    exit;
}
$stmt_check->close();

// Trava 4: Data não pode ser futura
$hoje = date('Y-m-d');
if ($data_evento > $hoje) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'A data do evento não pode ser futura.']);
    exit;
}

// Inserção no banco
$sql = "INSERT INTO Relatorio (id_responsavel, id_pessoa_tea, data, descricao /*, numFloat COLOCAR A VARIAVEL AQUI*/) VALUES (?, ?, ?, ?)"; // não esquecer do , ? em values
$stmt = $conexao->prepare($sql);
$stmt->bind_param("iiss", $id_responsavel, $id_pessoa_tea, $data_evento, $descricao, /*$numFloat nome da variável de novo */);
//++bind_param usa s para strings (text, date), i para int(numero inteiro), e d (float e double)
//Não esquece de apagar os comentários

if ($stmt->execute()) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Relatório salvo com sucesso!']);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao salvar. Tente novamente.']);
}

$stmt->close();
$conexao->close();
?>