<?php
    include_once('conexao.php');
    session_start();

    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    // LEFT JOIN para verificar status profissional
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