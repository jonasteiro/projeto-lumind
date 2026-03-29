<?php
    include_once('conexao.php');
    
    // Configurando o padrão de retorno
    $retorno = [
        'status'    => '', // ok - nok
        'mensagem'  => '',
        'data'      => []
    ];

    // Validação de campos
    if(empty($_POST['usuario']) || empty($_POST['senha'])){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Usuário e senha são obrigatórios',
            'data'      => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit();
    }

    // Sanitização de inputs
    $usuario = htmlspecialchars($_POST['usuario'], ENT_QUOTES, 'UTF-8');
    $senha = htmlspecialchars($_POST['senha'], ENT_QUOTES, 'UTF-8');

    // Validando se o usuário está ativo
    $stmt = $conexao->prepare("SELECT id, nome, usuario, nivel, ativo FROM cliente WHERE usuario = ? AND senha = ? AND ativo = 1");
    
    if(!$stmt){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro na preparação da consulta',
            'data'      => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit();
    }

    $stmt->bind_param("ss", $usuario, $senha);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0){
        $usuario_dados = $resultado->fetch_assoc();
        
        // Iniciando a sessão
        session_start();
        $_SESSION['usuario_id'] = $usuario_dados['id'];
        $_SESSION['usuario_nome'] = $usuario_dados['nome'];
        $_SESSION['usuario_login'] = $usuario_dados['usuario'];
        $_SESSION['usuario_nivel'] = $usuario_dados['nivel'];
        $_SESSION['logado'] = true;

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Login realizado com sucesso',
            'data'      => [
                'id' => $usuario_dados['id'],
                'nome' => $usuario_dados['nome'],
                'nivel' => $usuario_dados['nivel']
            ]
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Usuário ou senha incorretos',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
