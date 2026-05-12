<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');

// Busca as atividades e faz um JOIN para saber para quais pacientes elas foram enviadas
$sql = "
    SELECT 
        a.id_atividade, 
        a.titulo, 
        a.descricao, 
        a.categoria,
        p.nome as nome_paciente
    FROM Atividade a
    INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade
    INNER JOIN Usuario p ON pa.id_pessoa_tea = p.id_usuario
    ORDER BY a.id_atividade DESC
";

$resultado = $conexao->query($sql);

$atividades = [];
if ($resultado && $resultado->num_rows > 0) {
    $atividades = $resultado->fetch_all(MYSQLI_ASSOC);
}

// Imprime o resultado na tela!
echo json_encode([
    'total_encontrado' => count($atividades),
    'atividades' => $atividades
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conexao->close();
?>