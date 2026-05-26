<?php
    include_once('conexao.php');
    session_start();

    // É recomendável adicionar o cabeçalho JSON já que o retorno é sempre nesse formato
    header('Content-Type: application/json; charset=utf-8');

    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    // 1. Buscamos a coluna 'U.senha' e removemos a checagem da senha do WHERE
    $sql = "SELECT U.id_usuario, U.nome, U.email, U.senha, U.tipo_usuario, D.status_aprovacao 
            FROM Usuario U 
            LEFT JOIN Documentacao D ON U.id_usuario = D.id_usuario 
            WHERE U.email = ?";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("s", $email); // 2. Passamos apenas o e-mail na query
    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0){
        $usuario = $resultado->fetch_assoc();

        // 3. AQUI ENTRA A CRIPTOGRAFIA: Verifica se a senha digitada bate com o hash do banco
        if (password_verify($senha, $usuario['senha'])) {
            
            // O seu código original de verificação do profissional continua intacto
            if ($usuario['tipo_usuario'] === 'ProfissionalSaude') {
                
                if ($usuario['status_aprovacao'] !== 'Aprovado') {
                    
                    $mensagemStatus = "Seu cadastro ainda está em análise. Por favor, aguarde.";
                    
                    if ($usuario['status_aprovacao'] === 'Reprovado') {
                        $mensagemStatus = "Seu cadastro foi reprovado. Verifique o motivo na consulta de status.";
                    }

                    echo json_encode([
                        'status' => 'nok',
                        'mensagem' => $mensagemStatus
                    ]);
                    
                    $stmt->close();
                    $conexao->close();
                    exit;
                }
            }

            // Remove o hash do array antes de salvar na sessão por precaução e segurança
            unset($usuario['senha']);

            $_SESSION['usuario'] = $usuario;

            echo json_encode([
                'status' => 'ok',
                'data' => $usuario
            ]);

        } else {
            // Caso o password_verify retorne false (senha errada)
            echo json_encode([
                'status' => 'nok',
                'mensagem' => 'E-mail ou senha não conferem.'
            ]);
        }

    } else {
        // Caso o e-mail não seja encontrado no banco
        echo json_encode([
            'status' => 'nok',
            'mensagem' => 'E-mail ou senha não conferem.'
        ]);
    }

    $stmt->close();
    $conexao->close();
?>