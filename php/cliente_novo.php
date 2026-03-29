<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Sanitizar as informações que vem do front
    $nome       = htmlspecialchars($_POST['nome'], ENT_QUOTES, 'UTF-8');
    $email      = htmlspecialchars($_POST['email'], ENT_QUOTES, 'UTF-8');
    $usuario    = htmlspecialchars($_POST['usuario'], ENT_QUOTES, 'UTF-8');
    $senha      = $_POST['senha'];
    $instagram  = htmlspecialchars($_POST['instagram'] ?? '', ENT_QUOTES, 'UTF-8');
    $nivel      = htmlspecialchars($_POST['nivel'], ENT_QUOTES, 'UTF-8');
    $ativo      = (int) $_POST['ativo'];
    
    // Campos opcionais para profissional
    $data_nascimento = $_POST['data_nascimento'] ?? null;
    $telefone = htmlspecialchars($_POST['telefone'] ?? '', ENT_QUOTES, 'UTF-8');
    $especialidade = htmlspecialchars($_POST['especialidade'] ?? '', ENT_QUOTES, 'UTF-8');
    $registro_profissional = htmlspecialchars($_POST['registro_profissional'] ?? '', ENT_QUOTES, 'UTF-8');

    // Validações básicas
    if (empty($nome) || strlen($nome) < 3) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Nome deve ter no mínimo 3 caracteres',
            'data' => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Email inválido',
            'data' => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if (empty($usuario) || strlen($usuario) < 3) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Usuário deve ter no mínimo 3 caracteres',
            'data' => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    if (empty($senha) || strlen($senha) < 6) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Senha deve ter no mínimo 6 caracteres',
            'data' => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    // Verificar se email já existe
    $stmt_check = $conexao->prepare("SELECT id FROM cliente WHERE email = ? LIMIT 1");
    $stmt_check->bind_param("s", $email);
    $stmt_check->execute();
    $resultado = $stmt_check->get_result();

    if ($resultado->num_rows > 0) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Email já cadastrado no sistema',
            'data' => []
        ];
        $stmt_check->close();
        $conexao->close();
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }
    $stmt_check->close();

    // Verificar se usuário já existe
    $stmt_check = $conexao->prepare("SELECT id FROM cliente WHERE usuario = ? LIMIT 1");
    $stmt_check->bind_param("s", $usuario);
    $stmt_check->execute();
    $resultado = $stmt_check->get_result();

    if ($resultado->num_rows > 0) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Usuário já cadastrado no sistema',
            'data' => []
        ];
        $stmt_check->close();
        $conexao->close();
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }
    $stmt_check->close();

    // ========== INSERIR NA TABELA CLIENTE ==========
    $stmt = $conexao->prepare("
    INSERT INTO cliente(nome, email, usuario, senha, instagram, nivel, ativo) 
    VALUES(?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("ssssssi", $nome, $email, $usuario, $senha, $instagram, $nivel, $ativo);
    $stmt->execute();

    if($stmt->affected_rows <= 0) {
        $retorno = [
            'status' => 'erro',
            'mensagem' => 'Falha ao criar usuário',
            'data' => []
        ];
        $stmt->close();
        $conexao->close();
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    $cliente_id = $conexao->insert_id;
    $stmt->close();

    // ========== INSERIR DADOS ESPECÍFICOS CONFORME O NÍVEL ==========
    
    if ($nivel === 'profissional') {
        // Inserir na tabela profissional
        $stmt_prof = $conexao->prepare("
        INSERT INTO profissional(cliente_id, especialidade, registro_profissional, telefone, data_nascimento)
        VALUES(?, ?, ?, ?, ?)");
        
        $stmt_prof->bind_param("issss", $cliente_id, $especialidade, $registro_profissional, $telefone, $data_nascimento);
        $stmt_prof->execute();
        $stmt_prof->close();
    
    } elseif ($nivel === 'pessoa_tea') {
        // Inserir na tabela pessoa_tea (estrutura simples por enquanto)
        $stmt_tea = $conexao->prepare("
        INSERT INTO pessoa_tea(cliente_id)
        VALUES(?)");
        
        $stmt_tea->bind_param("i", $cliente_id);
        $stmt_tea->execute();
        $stmt_tea->close();
    
    } elseif ($nivel === 'responsavel') {
        // Inserir na tabela responsavel
        $stmt_resp = $conexao->prepare("
        INSERT INTO responsavel(cliente_id, telefone)
        VALUES(?, ?)");
        
        $stmt_resp->bind_param("is", $cliente_id, $telefone);
        $stmt_resp->execute();
        $stmt_resp->close();
    
    } elseif ($nivel === 'adm') {
        // Inserir na tabela adm
        $stmt_adm = $conexao->prepare("
        INSERT INTO adm(cliente_id)
        VALUES(?)");
        
        $stmt_adm->bind_param("i", $cliente_id);
        $stmt_adm->execute();
        $stmt_adm->close();
    }

    $retorno = [
        'status' => 'sucesso',
        'mensagem' => 'Usuário criado com sucesso',
        'data' => []
    ];

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);