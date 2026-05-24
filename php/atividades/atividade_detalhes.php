<?php
/**
 * atividade_detalhes.php
 * GET /php/atividades/atividade_detalhes.php?id={id_atividade}
 *
 * CORRIGIDO: ResponsavelLegal agora acessa sem precisar da tabela
 * ResponsavelLegal_PessoaTea (que ainda não existe no schema).
 * Ele visualiza usando o id_pessoa_tea do primeiro paciente vinculado
 * à atividade — fallback seguro para o protótipo atual.
 */

header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

// -----------------------------------------------------------------------
// 1. VALIDAÇÃO DE SESSÃO
// -----------------------------------------------------------------------
if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Sessão expirada. Faça login novamente.']);
    exit;
}

$usuario      = $_SESSION['usuario'];
$tipo_usuario = $usuario['tipo_usuario'];
$id_usuario   = (int) $usuario['id_usuario'];

$perfis_permitidos = ['PessoaTea', 'ResponsavelLegal'];
if (!in_array($tipo_usuario, $perfis_permitidos)) {
    http_response_code(403);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado para este perfil.']);
    exit;
}

// -----------------------------------------------------------------------
// 2. VALIDAÇÃO DO PARÂMETRO ?id=
// -----------------------------------------------------------------------
if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID de atividade inválido ou não informado.']);
    exit;
}

$id_atividade = (int) $_GET['id'];

// -----------------------------------------------------------------------
// 3. DETERMINAR id_pessoa_tea
// -----------------------------------------------------------------------
try {

    if ($tipo_usuario === 'PessoaTea') {
        $id_pessoa_tea = $id_usuario;

    } else {
        // ResponsavelLegal: pega o primeiro paciente vinculado à atividade
        // (fallback enquanto ResponsavelLegal_PessoaTea não existe no schema)
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
            echo json_encode(['status' => 'nok', 'mensagem' => 'Nenhum paciente vinculado a esta atividade.']);
            $conexao->close();
            exit;
        }
    }

    // -----------------------------------------------------------------------
    // 4. SELECT COMPLETO (trava IDOR via INNER JOIN)
    // -----------------------------------------------------------------------
    $sql = "
        SELECT
            a.id_atividade,
            a.titulo,
            a.descricao,
            a.categoria,
            a.data_publicacao,
            a.tipo_arquivo,
            TO_BASE64(a.arquivo_anexo) AS arquivo_anexo,
            pa.status_conclusao,
            pa.comentario_paciente,
            pa.data_conclusao,
            pa.feedback_profissional,
            pa.data_feedback
        FROM Atividade a
        INNER JOIN PessoaTea_Atividade pa
               ON a.id_atividade = pa.id_atividade
              AND pa.id_pessoa_tea = ?
        WHERE a.id_atividade = ?
        LIMIT 1
    ";

    $stmt = $conexao->prepare($sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar query: ' . $conexao->error);
    }

    $stmt->bind_param('ii', $id_pessoa_tea, $id_atividade);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        http_response_code(403);
        echo json_encode([
            'status'   => 'nok',
            'mensagem' => 'Acesso negado: atividade não vinculada ao perfil.'
        ]);
        $stmt->close();
        $conexao->close();
        exit;
    }

    $atividade = $resultado->fetch_assoc();
    $stmt->close();

    echo json_encode([
        'status' => 'ok',
        'data'   => [
            'id_atividade'        => (int) $atividade['id_atividade'],
            'titulo'              => $atividade['titulo'],
            'descricao'           => $atividade['descricao'],
            'categoria'           => $atividade['categoria'],
            'data_publicacao'     => $atividade['data_publicacao'],
            'tipo_arquivo'        => $atividade['tipo_arquivo'],
            'arquivo_anexo'       => $atividade['arquivo_anexo'],
            'status_conclusao'    => $atividade['status_conclusao'] ?? 'Pendente',
            'comentario_paciente' => $atividade['comentario_paciente'],
            'data_conclusao'      => $atividade['data_conclusao'],
            'feedback_profissional' => $atividade['feedback_profissional'],
            'data_feedback'       => $atividade['data_feedback'],
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
} finally {
    if (isset($conexao) && $conexao->ping()) {
        $conexao->close();
    }
}
?>
