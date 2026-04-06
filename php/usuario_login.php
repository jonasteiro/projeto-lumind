<?php
    include_once('conexao.php');
    session_start();

    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    // Adicionamos o LEFT JOIN para trazer o status_aprovacao se ele existir
    $sql = "SELECT U.id_usuario, U.nome, U.email, U.tipo_usuario, D.status_aprovacao 
            FROM Usuario U 
            LEFT JOIN Documentacao D ON U.id_usuario = D.id_usuario 
            WHERE U.email = ? AND U.senha = ?";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("ss", $email, $senha);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0){
        $usuario = $resultado->fetch_assoc();

        // --- VERIFICAÇÃO EXCLUSIVA PARA PROFISSIONAIS ---
        if ($usuario['tipo_usuario'] === 'ProfissionalSaude') {
            
            // Se o status for diferente de 'Aprovado', barramos o login
            if ($usuario['status_aprovacao'] !== 'Aprovado') {
                
                // Personaliza a mensagem baseada no status atual
                $mensagemStatus = "Seu cadastro ainda está em análise. Por favor, aguarde.";
                
                if ($usuario['status_aprovacao'] === 'Reprovado') {
                    $mensagemStatus = "Seu cadastro foi reprovado. Verifique o motivo na consulta de status.";
                }

                echo json_encode([
                    'status' => 'nok',
                    'mensagem' => $mensagemStatus
                ]);
                
                // Importante: encerra o script aqui para não logar
                $stmt->close();
                $conexao->close();
                exit;
            }
        }

        // --- LOGIN PARA ADMINS E PROFISSIONAIS APROVADOS ---
        $_SESSION['usuario'] = $usuario;

        echo json_encode([
            'status' => 'ok',
            'data' => $usuario
        ]);

    } else {
        echo json_encode([
            'status' => 'nok',
            'mensagem' => 'E-mail ou senha não conferem.'
        ]);
    }

    $stmt->close();
    $conexao->close();
?>