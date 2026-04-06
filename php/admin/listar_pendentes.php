<?php
include_once('../conexao.php');

$sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, P.registro_profissional, P.especialidade, D.data_envio 
        FROM Usuario U
        INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
        INNER JOIN Documentacao D ON U.id_usuario = D.id_usuario
        WHERE D.status_aprovacao = 'Aguardando'
        ORDER BY D.data_envio ASC";

$resultado = $conexao->query($sql);
$pendentes = [];

if ($resultado) {
    while ($linha = $resultado->fetch_assoc()) {
        $pendentes[] = $linha;
    }
}

header("Content-Type: application/json; charset=utf-8");
echo json_encode($pendentes);
?>