<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Sessão expirada.']);
    exit;
}

$usuario = $_SESSION['usuario'];
$tipo = $usuario['tipo_usuario'];
$id_usuario = (int) $usuario['id_usuario'];

if ($tipo !== 'ProfissionalSaude') {
    http_response_code(403);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Acesso negado.']);
    exit;
}

if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'erro', 'mensagem' => 'ID inválido.']);
    exit;
}

$id_atividade = (int) $_GET['id'];

try {
    // Verifica se a atividade pertence ao profissional
    $check = $conexao->prepare("SELECT id_atividade, titulo, descricao, categoria, data_publicacao, tipo_arquivo, TO_BASE64(arquivo_anexo) AS arquivo_anexo FROM Atividade WHERE id_atividade = ? AND id_profissional = ? LIMIT 1");
    $check->bind_param('ii', $id_atividade, $id_usuario);
    $check->execute();
    $res = $check->get_result();

    if ($res->num_rows === 0) {
        http_response_code(403);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Atividade não encontrada para este profissional.']);
        exit;
    }

    $atividade = $res->fetch_assoc();
    $check->close();

    // CORREÇÃO: Tirado o TO_BASE64 de pa.arquivo_resposta, pois ele já é LONGTEXT (Base64) no banco
    $stmt = $conexao->prepare(
        "SELECT 
            u.id_usuario, 
            pa.id_pessoa_tea, 
            u.nome, 
            pa.status_conclusao, 
            pa.comentario_paciente, 
            pa.data_conclusao, 
            pa.feedback_profissional, 
            pa.data_feedback,
            pa.tipo_arquivo_resposta,
            pa.arquivo_resposta
         FROM PessoaTea_Atividade pa
         JOIN Usuario u ON u.id_usuario = pa.id_pessoa_tea
         WHERE pa.id_atividade = ?"
    );
    $stmt->bind_param('i', $id_atividade);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $submissoes = [];
    while ($row = $resultado->fetch_assoc()) {
        $submissoes[] = $row;
    }

    echo json_encode(['status' => 'ok', 'atividade' => $atividade, 'submissoes' => $submissoes], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
} finally {
    $conexao->close();
}
?>