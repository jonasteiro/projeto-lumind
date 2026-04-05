<?php
    include_once('conexao.php');
    
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    //(Usuario)
    $nome            = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
    $email           = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $cpf             = htmlspecialchars($_POST['cpf'] ?? '', ENT_QUOTES, 'UTF-8'); 
    $senha           = $_POST['senha'] ?? ''; 
    $data_nascimento = $_POST['data_nascimento'] ?? ''; 
    $tipo_usuario    = htmlspecialchars($_POST['tipo_usuario'] ?? '', ENT_QUOTES, 'UTF-8'); 
    
    // ========== DADOS EXTRAS ==========
    $telefone        = htmlspecialchars($_POST['telefone'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Específicos do Profissional
    $registro_profissional = htmlspecialchars($_POST['registro_profissional'] ?? '', ENT_QUOTES, 'UTF-8');
    $especialidade         = htmlspecialchars($_POST['especialidade'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Específicos da Pessoa com TEA
    $nivel_tea  = htmlspecialchars($_POST['nivel_tea'] ?? '', ENT_QUOTES, 'UTF-8');
    $observacao = htmlspecialchars($_POST['observacao'] ?? '', ENT_QUOTES, 'UTF-8');

    // ========== VALIDAÇÕES BÁSICAS ==========
    
    if (empty($nome) || strlen($nome) < 3) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Nome deve ter no mínimo 3 caracteres', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Email inválido', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    if (empty($cpf) || strlen($cpf) !== 11) {
        $retorno = ['status' => 'erro', 'mensagem' => 'CPF deve conter 11 dígitos', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    if (empty($data_nascimento)) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Data de nascimento é obrigatória', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    if (empty($senha) || strlen($senha) < 6) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Senha deve ter no mínimo 6 caracteres', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    if (empty($tipo_usuario)) {
        $retorno = ['status' => 'erro', 'mensagem' => 'O tipo de usuário é obrigatório', 'data' => []];
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    // ========== VERIFICAÇÕES NO BANCO (Email e CPF) ==========
    
    $stmt_check = $conexao->prepare("SELECT id_usuario FROM Usuario WHERE email = ? OR cpf = ? LIMIT 1");
    $stmt_check->bind_param("ss", $email, $cpf);
    $stmt_check->execute();
    $resultado = $stmt_check->get_result();

    if ($resultado->num_rows > 0) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Email ou CPF já cadastrados no sistema.', 'data' => []];
        $stmt_check->close();
        $conexao->close();
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }
    $stmt_check->close();

    // ========== INSERIR NA TABELA MÃE (Usuario) ==========
    
    $stmt = $conexao->prepare("
        INSERT INTO Usuario (nome, email, senha, cpf, data_nascimento, tipo_usuario) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("ssssss", $nome, $email, $senha, $cpf, $data_nascimento, $tipo_usuario);
    $stmt->execute();

    if ($stmt->affected_rows <= 0) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Falha ao criar usuário base no banco de dados.', 'data' => []];
        $stmt->close();
        $conexao->close();
        ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }
    
    $id_usuario = $conexao->insert_id; // Pega o ID gerado para usar nas tabelas filhas e de telefone
    $stmt->close();

    // ========== INSERIR TELEFONE ==========
    
    if (!empty($telefone)) {
        $stmt_tel = $conexao->prepare("INSERT INTO Telefone (id_usuario, telefone) VALUES (?, ?)");
        $stmt_tel->bind_param("is", $id_usuario, $telefone);
        $stmt_tel->execute();
        $stmt_tel->close();
    }

    // ========== INSERIR NAS TABELAS FILHAS ==========
    
    if ($tipo_usuario === 'ProfissionalSaude') {
        $stmt_prof = $conexao->prepare("
            INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade)
            VALUES (?, ?, ?)
        ");
        $stmt_prof->bind_param("iss", $id_usuario, $registro_profissional, $especialidade);
        $stmt_prof->execute();
        $stmt_prof->close();

    } elseif ($tipo_usuario === 'PessoaTea') {
        if (empty($nivel_tea)) {
            $retorno = ['status' => 'erro', 'mensagem' => 'Nível de TEA é obrigatório para este perfil.', 'data' => []];
            ob_clean(); header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
        }
        
        $stmt_tea = $conexao->prepare("INSERT INTO PessoaTea (id_usuario, observacao, nivel_tea) VALUES (?, ?, ?)");
        $stmt_tea->bind_param("iss", $id_usuario, $observacao, $nivel_tea);
        $stmt_tea->execute();
        $stmt_tea->close();

    } elseif ($tipo_usuario === 'ResponsavelLegal') {
        $stmt_resp = $conexao->prepare("INSERT INTO ResponsavelLegal (id_usuario) VALUES (?)");
        $stmt_resp->bind_param("i", $id_usuario);
        $stmt_resp->execute();
        $stmt_resp->close();

    } elseif ($tipo_usuario === 'Administrador') {
        $stmt_adm = $conexao->prepare("INSERT INTO Administrador (id_usuario, status_adm) VALUES (?, TRUE)");
        $stmt_adm->bind_param("i", $id_usuario);
        $stmt_adm->execute();
        $stmt_adm->close();
    }

    
    $retorno = ['status' => 'sucesso', 'mensagem' => 'Usuário cadastrado com sucesso!', 'data' => []];
    $conexao->close();
    
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>