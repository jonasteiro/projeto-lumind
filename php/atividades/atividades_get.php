<?php
session_start();
require_once('../conexao.php'); 

// 1. Pegue os dados da sessão (Onde o login salvou)
// Note que usamos o nome 'tipo_usuario' para bater com o seu banco
$id_usuario = $_SESSION['usuario']['id_usuario'] ?? null;
$tipo_usuario = $_SESSION['usuario']['tipo_usuario'] ?? null; 

// 2. Trava de segurança
if (!$id_usuario) {
    echo json_encode([]); 
    exit;
}

try {
    if ($tipo_usuario === 'ProfissionalSaude') {
    // CENÁRIO 1: Busca atividades criadas pelo profissional
    $sql = "SELECT id_atividade, titulo, categoria, data_publicacao 
            FROM Atividade 
            WHERE id_profissional = ? 
            ORDER BY data_publicacao DESC";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_usuario);

} elseif ($tipo_usuario === 'PessoaTea') {
    // CENÁRIO 2A: Busca atividades vinculadas diretamente ao paciente
    $sql = "SELECT a.id_atividade, a.titulo, a.categoria, a.data_publicacao 
            FROM Atividade a 
            INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade 
            WHERE pa.id_pessoa_tea = ? 
            ORDER BY a.data_publicacao DESC";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_usuario);

} elseif ($tipo_usuario === 'ResponsavelLegal') {
    // CENÁRIO 2B: Busca atividades do dependente vinculado a este responsável
    // ISOLAMENTO ABSOLUTO (Cenário 5): o WHERE usa id_responsavel = ?, garantindo
    // que um responsável nunca veja dados de outro dependente.
    $sql = "SELECT a.id_atividade, a.titulo, a.categoria, a.data_publicacao 
            FROM Atividade a 
            INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade 
            INNER JOIN PessoaTea pt ON pa.id_pessoa_tea = pt.id_usuario 
            WHERE pt.id_responsavel = ? 
            ORDER BY a.data_publicacao DESC";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_usuario);

} else {
    // Perfil desconhecido: retorna vazio por segurança
    echo json_encode([]);
    exit;
}

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $atividades = [];
    while ($row = $resultado->fetch_assoc()) {
        $atividades[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($atividades, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["erro" => $e->getMessage()]);
}