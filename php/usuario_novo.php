<?php
    // INICIA A SESSÃO PARA RESGATAR O PROFISSIONAL LOGADO
    session_start(); 
    include_once('conexao.php');
    
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Recupera o ID do profissional logado da sessão
    // OBS: Ajuste 'id_usuario' caso a sua variável de sessão tenha outro nome
    $id_profissional_logado = $_SESSION['usuario']['id_usuario'] ?? null;

    // Usuario
    $nome            = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
    $email           = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $cpf             = htmlspecialchars($_POST['cpf'] ?? '', ENT_QUOTES, 'UTF-8'); 
    $senha           = $_POST['senha'] ?? ''; 
    $data_nascimento = $_POST['data_nascimento'] ?? ''; 
    $tipo_usuario    = htmlspecialchars($_POST['tipo_usuario'] ?? '', ENT_QUOTES, 'UTF-8'); 
    $telefone        = htmlspecialchars($_POST['telefone'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Específicos do Profissional
    $registro_profissional = htmlspecialchars($_POST['registro_profissional'] ?? '', ENT_QUOTES, 'UTF-8');
    $especialidade         = htmlspecialchars($_POST['especialidade'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Específicos da Pessoa com TEA
    $nivel_tea      = htmlspecialchars($_POST['nivel_tea'] ?? '', ENT_QUOTES, 'UTF-8');
    $observacao     = htmlspecialchars($_POST['observacao'] ?? '', ENT_QUOTES, 'UTF-8');
    // NOVO: Resgata o ID do responsável escolhido no formulário HTML
    $cpf_responsavel = htmlspecialchars($_POST['cpf_responsavel'] ?? '', ENT_QUOTES, 'UTF-8'); 

    // VALIDAÇÃO ARQUIVOS
    if ($tipo_usuario === 'ProfissionalSaude') {
        if (!isset($_FILES['certificacao_profissional']) || $_FILES['certificacao_profissional']['error'] !== 0 ||
            !isset($_FILES['carteira_identidade_nacional']) || $_FILES['carteira_identidade_nacional']['error'] !== 0) {
            
            $retorno = ['status' => 'erro', 'mensagem' => 'Os documentos obrigatórios não foram enviados.', 'data' => []];
            header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
        }
    }

    if (empty($nome) || strlen($nome) < 3) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Nome muito curto', 'data' => []];
        header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }

    // verifica email e cpf
    $stmt_check = $conexao->prepare("SELECT id_usuario FROM Usuario WHERE email = ? OR cpf = ? LIMIT 1");
    $stmt_check->bind_param("ss", $email, $cpf);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows > 0) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Email ou CPF já cadastrados.', 'data' => []];
        $stmt_check->close(); $conexao->close();
        header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }
    $stmt_check->close();

    $stmt = $conexao->prepare("INSERT INTO Usuario (nome, email, senha, cpf, data_nascimento, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $nome, $email, $senha, $cpf, $data_nascimento, $tipo_usuario);
    $stmt->execute();
    
    if ($stmt->affected_rows <= 0) {
        $retorno = ['status' => 'erro', 'mensagem' => 'Falha ao criar usuário base.', 'data' => []];
        $stmt->close(); $conexao->close();
        header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
    }
    
    $id_usuario = $conexao->insert_id; 
    $stmt->close();

    if (!empty($telefone)) {
        $stmt_tel = $conexao->prepare("INSERT INTO Telefone (id_usuario, telefone) VALUES (?, ?)");
        $stmt_tel->bind_param("is", $id_usuario, $telefone);
        $stmt_tel->execute(); $stmt_tel->close();
    }

    if ($tipo_usuario === 'ProfissionalSaude') {
        $stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) VALUES (?, ?, ?)");
        $stmt_prof->bind_param("iss", $id_usuario, $registro_profissional, $especialidade);
        $stmt_prof->execute(); $stmt_prof->close();

        $bin_certificacao = file_get_contents($_FILES['certificacao_profissional']['tmp_name']);
        $bin_identidade   = file_get_contents($_FILES['carteira_identidade_nacional']['tmp_name']);

        $stmt_doc = $conexao->prepare("INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional) VALUES (?, ?, ?)");
        $null = NULL;
        $stmt_doc->bind_param("ibb", $id_usuario, $null, $null);
        $stmt_doc->send_long_data(1, $bin_certificacao);
        $stmt_doc->send_long_data(2, $bin_identidade);
        $stmt_doc->execute(); $stmt_doc->close();

    } elseif ($tipo_usuario === 'PessoaTea') {
        if (!$id_profissional_logado || empty($cpf_responsavel)) {
            $retorno = ['status' => 'erro', 'mensagem' => 'Profissional logado ou CPF do Responsável não identificados.', 'data' => []];
            header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
        }

        // 1. Busca o ID do Responsável pelo CPF fornecido, garantindo que é atrelado a este profissional
        $stmt_busca = $conexao->prepare("
            SELECT R.id_usuario 
            FROM ResponsavelLegal R
            JOIN Usuario U ON R.id_usuario = U.id_usuario
            WHERE U.cpf = ? AND R.id_profissional = ?
        ");
        $stmt_busca->bind_param("si", $cpf_responsavel, $id_profissional_logado);
        $stmt_busca->execute();
        $resultado_busca = $stmt_busca->get_result();

        if ($resultado_busca->num_rows === 0) {
            $retorno = ['status' => 'erro', 'mensagem' => 'Nenhum Responsável encontrado com este CPF vinculado a você.', 'data' => []];
            $stmt_busca->close(); $conexao->close();
            header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
        }

        // Pega o ID encontrado
        $linha_resp = $resultado_busca->fetch_assoc();
        $id_responsavel_encontrado = $linha_resp['id_usuario'];
        $stmt_busca->close();

        // 2. Realiza o cadastro usando o ID encontrado
        $stmt_tea = $conexao->prepare("INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) VALUES (?, ?, ?, ?, ?)");
        $stmt_tea->bind_param("iiiss", $id_usuario, $id_profissional_logado, $id_responsavel_encontrado, $observacao, $nivel_tea);
        $stmt_tea->execute(); 
        $stmt_tea->close();

    } elseif ($tipo_usuario === 'ResponsavelLegal') {
        // NOVO: Trava de segurança
        if (!$id_profissional_logado) {
            $retorno = ['status' => 'erro', 'mensagem' => 'Falha de vínculo: Nenhum profissional autenticado na sessão.', 'data' => []];
            header("Content-type:application/json;charset=utf-8"); echo json_encode($retorno); exit;
        }

        // NOVO: Adicionado id_profissional na Query ("ii")
        $stmt_resp = $conexao->prepare("INSERT INTO ResponsavelLegal (id_usuario, id_profissional) VALUES (?, ?)");
        $stmt_resp->bind_param("ii", $id_usuario, $id_profissional_logado);
        $stmt_resp->execute(); $stmt_resp->close();

    } elseif ($tipo_usuario === 'Administrador') {
        $stmt_adm = $conexao->prepare("INSERT INTO Administrador (id_usuario, status_adm) VALUES (?, TRUE)");
        $stmt_adm->bind_param("i", $id_usuario);
        $stmt_adm->execute(); $stmt_adm->close();
    }

    $retorno = ['status' => 'sucesso', 'mensagem' => 'Cadastro realizado com sucesso!', 'data' => []];
    $conexao->close();
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>
