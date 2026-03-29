<?php
    // Inicia a sessão se não estiver iniciada
    if(session_status() == PHP_SESSION_NONE){
        session_start();
    }

    // Limpa todas as variáveis da sessão
    session_unset();
    
    // Destrói a sessão
    session_destroy();
    
    // Retorna resposta JSON
    $retorno = [
        'status'    => 'ok',
        'mensagem'  => 'Desconectado com sucesso',
        'data'      => []
    ];
    
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
