<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Validação de sessão — padrão do projeto: $_SESSION['usuario'][...]
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'ProfissionalSaude') {
    http_response_code(401);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Acesso não autorizado']);
    exit;
}

require_once '../conexao.php';

// Validação de entrada
if (!isset($_POST['id_atividade']) || !isset($_POST['id_pessoa_tea']) || !isset($_POST['feedback'])) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Dados incompletos']);
    exit;
}

$id_atividade = intval($_POST['id_atividade']);
$id_pessoa_tea = intval($_POST['id_pessoa_tea']);
$feedback = trim($_POST['feedback']);
$id_profissional = (int) $_SESSION['usuario']['id_usuario'];
//++INSERIR VARIAVEL NOVA PRA FEEDBACK
//$nota_feedback = $_POST['nota_feedback'] ?? null;

// Validação básica
if (empty($feedback) || strlen($feedback) < 5) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Feedback deve ter pelo menos 5 caracteres']);
    exit;
}

if (strlen($feedback) > 1000) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Feedback não pode ter mais de 1000 caracteres']);
    exit;
}

try {
    // Verificar se a atividade pertence ao profissional (IDOR check)
    $stmt = $conexao->prepare("
        SELECT a.id_atividade 
        FROM Atividade a
        WHERE a.id_atividade = ? AND a.id_profissional = ?
    ");
    
    if (!$stmt) {
        throw new Exception("Erro na query de verificação: " . $conexao->error);
    }
    
    $stmt->bind_param("ii", $id_atividade, $id_profissional);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Atividade não encontrada ou acesso negado']);
        exit;
    }
    
    // Verificar se existe submissão da pessoa_tea
    $stmt = $conexao->prepare("
        SELECT id_pessoa_tea 
        FROM PessoaTea_Atividade
        WHERE id_atividade = ? AND id_pessoa_tea = ?
    ");
    
    if (!$stmt) {
        throw new Exception("Erro na query de verificação de submissão: " . $conexao->error);
    }
    
    $stmt->bind_param("ii", $id_atividade, $id_pessoa_tea);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Submissão não encontrada']);
        exit;
    }
    
    // Atualizar ou inserir feedback + marcar como Avaliada
    //++COLOCAR O CAMPO DE FEEDBACK NO UPDATE
    $stmt = $conexao->prepare("
        UPDATE PessoaTea_Atividade
        SET feedback_profissional = ?,
            data_feedback = NOW(),
            status_conclusao = 'Avaliada',
            nota_feedback = ?
        WHERE id_atividade = ? AND id_pessoa_tea = ?
    ");
    //COLOCAR CAMPO ABAIXO DE STATUS_CONCLUSAO (nao esquecer da virgula depois de 'Avaliada')
    //EX: nota_feedback = ? (Não precisa mais de virgula)
    
    if (!$stmt) {
        throw new Exception("Erro na query de atualização: " . $conexao->error);
    }

    //++COLOCAR NO BINDPARAM O CAMPO
    $stmt->bind_param("sii", $feedback, $id_atividade, $id_pessoa_tea);
    //COLOCAR CAMPO NO BIND_PARAM
    //text, date = s; int = i; float = d
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar: " . $stmt->error);
    }
    
    $stmt->close();
    
    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Feedback enviado com sucesso!'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Erro ao salvar feedback: ' . $e->getMessage()
    ]);
}

$conexao->close();
?>