<?php
/**
 * concluir_atividade.php
 * POST /php/atividades/concluir_atividade.php
 *
 * ATUALIZADO: Agora recebe Multipart FormData ($_POST e $_FILES)
 * para suportar anexos (fotos/pdf) enviados pelo paciente.
 */

header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Sessão expirada.']);
    exit;
}

$usuario      = $_SESSION['usuario'];
$tipo_usuario = $usuario['tipo_usuario'];
$id_usuario   = (int) $usuario['id_usuario'];

if (!in_array($tipo_usuario, ['PessoaTea', 'ResponsavelLegal'])) {
    http_response_code(403);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Use POST.']);
    exit;
}

// Verifica se o ID da atividade foi enviado via POST (FormData)
if (!isset($_POST['id_atividade'])) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID da atividade não fornecido.']);
    exit;
}

$id_atividade        = (int) $_POST['id_atividade'];
$comentario_paciente = (isset($_POST['comentario_paciente']) && $_POST['comentario_paciente'] !== '')
                       ? trim($_POST['comentario_paciente'])
                       : null;

if ($id_atividade <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'id_atividade inválido.']);
    exit;
}

// Processamento do Arquivo Anexo (se houver)
$arquivo_resposta = null;
$tipo_arquivo_resposta = null;

if (isset($_FILES['arquivo_resposta']) && $_FILES['arquivo_resposta']['error'] === UPLOAD_ERR_OK) {
    $tipo_arquivo_resposta = $_FILES['arquivo_resposta']['type'];
    // Converte o arquivo para Base64 para salvar no banco (mesmo padrão usado no profissional)
    $arquivo_resposta = base64_encode(file_get_contents($_FILES['arquivo_resposta']['tmp_name']));
}

try {
    // Determina id_pessoa_tea
    if ($tipo_usuario === 'PessoaTea') {
        $id_pessoa_tea = $id_usuario;
    } else {
        // ResponsavelLegal: usa o primeiro paciente vinculado à atividade
        $id_pessoa_tea = null;
        $q = $conexao->prepare("SELECT id_pessoa_tea FROM PessoaTea_Atividade WHERE id_atividade = ? LIMIT 1");
        if ($q) {
            $q->bind_param('i', $id_atividade);
            $q->execute();
            $res = $q->get_result();
            if ($res && $res->num_rows > 0) {
                $row = $res->fetch_assoc();
                $id_pessoa_tea = (int) $row['id_pessoa_tea'];
            }
            $q->close();
        }
        if (!$id_pessoa_tea) {
            http_response_code(404);
            echo json_encode(['status' => 'nok', 'mensagem' => 'Paciente não encontrado para esta atividade.']);
            $conexao->close();
            exit;
        }
    }

    // Prepara a query dinamicamente (se tem arquivo ou não)
    if ($arquivo_resposta !== null) {
        $sql = "
            UPDATE PessoaTea_Atividade
            SET
                status_conclusao      = 'Concluída',
                comentario_paciente   = ?,
                arquivo_resposta      = ?,
                tipo_arquivo_resposta = ?,
                data_conclusao        = NOW()
            WHERE id_atividade  = ?
              AND id_pessoa_tea = ?
              AND status_conclusao != 'Avaliada'
        ";
        $stmt = $conexao->prepare($sql);
        if (!$stmt) throw new Exception('Erro ao preparar query: ' . $conexao->error);
        $stmt->bind_param('sssii', $comentario_paciente, $arquivo_resposta, $tipo_arquivo_resposta, $id_atividade, $id_pessoa_tea);
    } else {
        $sql = "
            UPDATE PessoaTea_Atividade
            SET
                status_conclusao    = 'Concluída',
                comentario_paciente = ?,
                data_conclusao      = NOW()
            WHERE id_atividade  = ?
              AND id_pessoa_tea = ?
              AND status_conclusao != 'Avaliada'
        ";
        $stmt = $conexao->prepare($sql);
        if (!$stmt) throw new Exception('Erro ao preparar query: ' . $conexao->error);
        $stmt->bind_param('sii', $comentario_paciente, $id_atividade, $id_pessoa_tea);
    }

    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        // Verifica se o bloqueio foi por status 'Avaliada' ou acesso indevido
        $check = $conexao->prepare("SELECT status_conclusao FROM PessoaTea_Atividade WHERE id_atividade = ? AND id_pessoa_tea = ? LIMIT 1");
        $check->bind_param('ii', $id_atividade, $id_pessoa_tea);
        $check->execute();
        $res_check = $check->get_result();

        if ($res_check->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado: atividade não pertence a este perfil.']);
            $check->close();
            $conexao->close();
            exit;
        }

        $row_check = $res_check->fetch_assoc();
        $check->close();

        if ($row_check['status_conclusao'] === 'Avaliada') {
            http_response_code(403);
            echo json_encode(['status' => 'nok', 'mensagem' => 'Esta atividade já foi avaliada pelo profissional e não pode ser reenviada.']);
            $conexao->close();
            exit;
        }

        // Se chegou aqui, os dados enviados são idênticos aos que já estavam no banco
        echo json_encode(['status' => 'ok', 'mensagem' => 'Envio registrado!']);
        $conexao->close();
        exit;
    }

    $stmt->close();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade concluída com sucesso!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro interno: ' . $e->getMessage()]);
} finally {
    if (isset($conexao) && $conexao->ping()) {
        $conexao->close();
    }
}
?>