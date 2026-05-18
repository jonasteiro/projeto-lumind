<?php
header('Content-Type: application/json; charset=utf-8');

// O SEGREDO ESTÁ AQUI: Os dois pontinhos para voltar para a pasta /php/
include_once('../conexao.php');

// Busca apenas os usuários que são do tipo 'PessoaTea'
$sql = "SELECT id_usuario, nome FROM Usuario WHERE tipo_usuario = 'PessoaTea'";
$resultado = $conexao->query($sql);

$pacientes = [];
if ($resultado && $resultado->num_rows > 0) {
    $pacientes = $resultado->fetch_all(MYSQLI_ASSOC);
}

echo json_encode($pacientes);
$conexao->close();
?>