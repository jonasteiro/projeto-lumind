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
    // 3. O SEGREDO: Aqui na linha 22, use o nome EXATO que definiu acima
    if ($tipo_usuario === 'ProfissionalSaude') { 
        // Busca atividades criadas pelo Dr. Roberto
        $sql = "SELECT id_atividade, titulo, categoria, data_publicacao 
                FROM Atividade 
                WHERE id_profissional = ? 
                ORDER BY data_publicacao DESC";
    } else {
        // Busca atividades vinculadas ao paciente
        $sql = "SELECT a.id_atividade, a.titulo, a.categoria, a.data_publicacao 
                FROM Atividade a 
                INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade 
                WHERE pa.id_pessoa_tea = ? 
                ORDER BY a.data_publicacao DESC";
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