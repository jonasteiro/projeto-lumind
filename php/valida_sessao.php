<?php
    session_start();

    $retorno = ['status' => 'nok', 'usuario' => null];

    if (isset($_SESSION['usuario'])) {
        $retorno = [
            'status' => 'ok',
            'usuario' => $_SESSION['usuario'] // Aqui vai o ID, Nome e o TIPO_USUARIO
        ];
    }

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>