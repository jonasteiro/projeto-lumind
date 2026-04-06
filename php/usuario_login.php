<?php
    include_once('conexao.php');
    session_start();

    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $stmt = $conexao->prepare("SELECT id_usuario, nome, email, tipo_usuario FROM Usuario WHERE email = ? AND senha = ?");
    $stmt->bind_param("ss", $email, $senha);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0){
        $usuario = $resultado->fetch_assoc();
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