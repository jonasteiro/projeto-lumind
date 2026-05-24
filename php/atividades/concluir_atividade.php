<?php
/**
 * concluir_atividade.php
 * POST /php/atividades/concluir_atividade.php
 * Body JSON: { "id_atividade": 5, "comentario_paciente": "..." }
 *
 * CORRIGIDO: ResponsavelLegal agora resolve o id_pessoa_tea via
 * primeiro paciente vinculado à atividade (fallback sem tabela de vínculo).
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

$body = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !isset($body['id_atividade'])) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Body inválido.']);
    exit;
}

$id_atividade        = (int) $body['id_atividade'];
$comentario_paciente = (isset($body['comentario_paciente']) && $body['comentario_paciente'] !== '')
                       ? trim($body['comentario_paciente'])
                       : null;

if ($id_atividade <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'id_atividade inválido.']);
    exit;
}

try {
    // Determina id_pessoa_tea
    if ($tipo_usuario === 'PessoaTea') {
        $id_pessoa_tea = $id_usuario;
    } else {
        // ResponsavelLegal: usa o primeiro paciente vinculado à atividade
        $id_pessoa_tea = null;
        $q = $conexao->prepare(
            "SELECT id_pessoa_tea FROM PessoaTea_Atividade WHERE id_atividade = ? LIMIT 1"
        );
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

    $sql = "
        UPDATE PessoaTea_Atividade
        SET
            status_conclusao    = 'Concluída',
            comentario_paciente = ?,
            data_conclusao      = NOW()
        WHERE id_atividade  = ?
          AND id_pessoa_tea  = ?
    ";

    $stmt = $conexao->prepare($sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar query: ' . $conexao->error);
    }

    $stmt->bind_param('sii', $comentario_paciente, $id_atividade, $id_pessoa_tea);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        $stmt->close();
        // Verifica se o registro existe (para distinguir IDOR de "dados iguais")
        $check = $conexao->prepare(
            "SELECT 1 FROM PessoaTea_Atividade WHERE id_atividade = ? AND id_pessoa_tea = ? LIMIT 1"
        );
        $check->bind_param('ii', $id_atividade, $id_pessoa_tea);
        $check->execute();
        $check->store_result();

        if ($check->num_rows === 0) {
            http_response_code(403);
            echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado: atividade não pertence a este perfil.']);
            $check->close();
            $conexao->close();
            exit;
        }
        $check->close();
        // Dados idênticos, sem erro real
        echo json_encode(['status' => 'ok', 'mensagem' => 'Envio registrado!']);
        $conexao->close();
        exit;
    }

    $stmt->close();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade concluída com sucesso!']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro: ' . $e->getMessage()]);
} finally {
    if (isset($conexao) && $conexao->ping()) {
        $conexao->close();
    }
}
?>
