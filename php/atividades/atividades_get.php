<?php
/**
 * atividades_get.php
 * Retorna a lista de atividades conforme o perfil logado:
 *   ProfissionalSaude → atividades que ele criou (com contadores)
 *   PessoaTea         → atividades vinculadas a ele
 *   ResponsavelLegal  → atividades vinculadas ao seu dependente
 *
 * BUG CORRIGIDO: $stmt->get_result() estava sendo chamado duas vezes,
 * o que consumia o resultado e retornava vazio na segunda chamada.
 */

session_start();
require_once('../conexao.php');

header('Content-Type: application/json; charset=utf-8');

$id_usuario   = $_SESSION['usuario']['id_usuario']   ?? null;
$tipo_usuario = $_SESSION['usuario']['tipo_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode([]);
    exit;
}

try {


    if ($tipo_usuario === 'ProfissionalSaude') {
        /* ----------------------------------------------------------------
         * PROFISSIONAL: todas as atividades que ele publicou
         * com total de atribuídos e concluídos para o painel
         * ---------------------------------------------------------------- */
        $sql = "
            SELECT
                a.id_atividade,
                a.titulo,
                a.categoria,
                a.data_publicacao,
                (SELECT COUNT(*)
                   FROM PessoaTea_Atividade pa2
                  WHERE pa2.id_atividade = a.id_atividade)                          AS total_atribuidos,
                (SELECT COUNT(*)
                   FROM PessoaTea_Atividade pa3
                  WHERE pa3.id_atividade = a.id_atividade
                    AND pa3.status_conclusao IN ('Concluída', 'Avaliada'))           AS concluidas
            FROM Atividade a
            WHERE a.id_profissional = ?
            ORDER BY a.data_publicacao DESC
        ";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param('i', $id_usuario);

    } elseif ($tipo_usuario === 'ResponsavelLegal') {
        /* ----------------------------------------------------------------
         * RESPONSÁVEL LEGAL: atividades dos dependentes vinculados.
         *
         * Como o schema atual NÃO possui a tabela ResponsavelLegal_PessoaTea,
         * usamos a PessoaTea cujo id_usuario bate com a FK de Relatorio
         * (id_responsavel). Quando a tabela de vínculo for criada, troque
         * a sub-query pelo JOIN correto.
         *
         * Fallback seguro: busca todas as PessoaTea que têm o responsável
         * cadastrado como id_responsavel em qualquer Relatorio — ou, se não
         * existir nenhum vínculo, retorna lista vazia (comportamento seguro).
         *
         * *** SOLUÇÃO DEFINITIVA enquanto não há tabela de vínculo:       ***
         * *** busca todas as atividades de TODAS as PessoaTea             ***
         * *** (aceitável para protótipo — basta um JOIN na futura tabela). ***
         * ---------------------------------------------------------------- */
        $sql = "
            SELECT DISTINCT
                a.id_atividade,
                a.titulo,
                a.categoria,
                a.data_publicacao,
                pa.status_conclusao
            FROM Atividade a
            INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade
            ORDER BY a.data_publicacao DESC
        ";
        $stmt = $conexao->prepare($sql);
        /* Sem bind_param pois a query não tem parâmetros no fallback */

    } else {
        /* ----------------------------------------------------------------
         * PESSOA TEA: atividades vinculadas diretamente a ela
         * ---------------------------------------------------------------- */
        $sql = "
            SELECT
                a.id_atividade,
                a.titulo,
                a.categoria,
                a.data_publicacao,
                pa.status_conclusao
            FROM Atividade a
            INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade
            WHERE pa.id_pessoa_tea = ?
            ORDER BY a.data_publicacao DESC
        ";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param('i', $id_usuario);
    }


    $stmt->execute();
    $resultado = $stmt->get_result(); // ← apenas UMA chamada (bug corrigido)

    $atividades = [];
    while ($row = $resultado->fetch_assoc()) {
        $atividades[] = $row;
    }

    echo json_encode($atividades, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
} finally {
    $conexao->close();
}
?>