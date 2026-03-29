<?php
// Função para validar segurança da sessão
function validar_sessao($nivel_permitido = []){
    // Iniciando a sessão se ainda não foi iniciada
    if(session_status() == PHP_SESSION_NONE){
        session_start();
    }

    // Verifica se o usuário está logado
    if(!isset($_SESSION['logado']) || $_SESSION['logado'] !== true){
        // Redireciona para login
        header("Location: ../login/index.html");
        exit();
    }

    // Se há restrição de nível, valida
    if(!empty($nivel_permitido)){
        if(!in_array($_SESSION['usuario_nivel'], $nivel_permitido)){
            // Usuário não tem permissão
            header("Location: ../login/index.html");
            exit();
        }
    }
}

// Função para redirecionar após login conforme nível
function redirecionar_por_nivel(){
    if(session_status() == PHP_SESSION_NONE){
        session_start();
    }

    if(!isset($_SESSION['usuario_nivel'])){
        header("Location: ../login/index.html");
        exit();
    }

    switch($_SESSION['usuario_nivel']){
        case 'adm':
            header("Location: ../home/dashboard-administrador.html");
            exit();
        case 'profissional':
            header("Location: ../home/dashboard-profissional.html");
            exit();
        case 'responsavel':
            header("Location: ../home/dashboard-profissional.html");
            exit();
        case 'pessoa_tea':
            header("Location: ../home/index.html");
            exit();
        default:
            header("Location: ../login/index.html");
            exit();
    }
}

// Função para obter dados da sessão (AJAX)
function obter_dados_sessao(){
    if(session_status() == PHP_SESSION_NONE){
        session_start();
    }

    if(isset($_SESSION['logado']) && $_SESSION['logado'] === true){
        return [
            'status'    => 'ok',
            'logado'    => true,
            'usuario_id' => $_SESSION['usuario_id'],
            'usuario_nome' => $_SESSION['usuario_nome'],
            'usuario_nivel' => $_SESSION['usuario_nivel']
        ];
    }else{
        return [
            'status'    => 'nok',
            'logado'    => false
        ];
    }
}
