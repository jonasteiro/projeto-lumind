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
$observacoes_extras = htmlspecialchars($_POST['observacoes_extras'] ?? '', ENT_QUOTES, 'UTF-8');

$titulo_relatorio = htmlspecialchars($_POST['titulo_relatorio'] ?? '', ENT_QUOTES, 'UTF-8');
$recomendacoes_casa = htmlspecialchars($_POST['recomendacoes_casa'] ?? '', ENT_QUOTES, 'UTF-8');

$data_proxima_avaliacao = !empty($_POST['data_proxima_avaliacao']) ? $_POST['data_proxima_avaliacao'] : null;

$duracao_minutos = !empty($_POST['duracao_minutos']) ? (int) $_POST['duracao_minutos'] : null;

$progresso_bruto = !empty($_POST['progresso_percentual']) ? $_POST['progresso_percentual'] : '0';
$progresso_percentual = (float) str_replace(',', '.', $progresso_bruto);


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
$sql = "INSERT INTO Relatorio (
            id_responsavel, id_pessoa_tea, data, descricao, 
            titulo_relatorio, recomendacoes_casa, data_proxima_avaliacao, duracao_minutos, progresso_percentual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conexao->prepare($sql);


// Atualização do bind_param
// id_responsavel (i)
// id_pessoa_tea (i)
// data (s)
// descricao (s)
// titulo_relatorio (s - VARCHAR)
// recomendacoes_casa (s - TEXT)
// data_proxima_avaliacao (s - DATE)
// duracao_minutos (i - INT)
// progresso_percentual (d - FLOAT)
// RESULTADO DA STRING: "iisssssid"

$stmt->bind_param("iisssssid", $id_responsavel, $id_pessoa_tea, $data_evento, $descricao, $titulo_relatorio, $recomendacoes_casa, $data_proxima_avaliacao, $duracao_minutos, $progresso_percentual
);

if ($stmt->execute()) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Relatório salvo com sucesso!']);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao salvar. Tente novamente.']);
}

$stmt->close();
$conexao->close();
?>