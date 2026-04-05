<?php
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => ''];

    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        $nome = $_POST['nome'];
        $email = $_POST['email'];
        $cpf = $_POST['cpf'];
        $telefone = $_POST['telefone'];
        $data_nascimento = $_POST['data_nascimento'];
        $senha = $_POST['senha'];

        // 1. UPDATE TABELA USUARIO
        if(!empty($senha)){
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, senha = ? WHERE id_usuario = ?");
            $stmt->bind_param("sssssi", $nome, $email, $cpf, $data_nascimento, $senha, $id);
        } else {
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_usuario = ?");
            $stmt->bind_param("ssssi", $nome, $email, $cpf, $data_nascimento, $id);
        }
        $stmt->execute();

        // 2. UPDATE TABELA TELEFONE
        // Primeiro verificamos se já existe um telefone para este ID para decidir entre UPDATE ou INSERT
        $checkTel = $conexao->prepare("SELECT id_usuario FROM Telefone WHERE id_usuario = ?");
        $checkTel->bind_param("i", $id);
        $checkTel->execute();
        $resCheck = $checkTel->get_result();

        if($resCheck->num_rows > 0){
            $stmt_tel = $conexao->prepare("UPDATE Telefone SET telefone = ? WHERE id_usuario = ?");
            $stmt_tel->bind_param("si", $telefone, $id);
        } else {
            $stmt_tel = $conexao->prepare("INSERT INTO Telefone (telefone, id_usuario) VALUES (?, ?)");
            $stmt_tel->bind_param("si", $telefone, $id);
        }
        $stmt_tel->execute();

        if($stmt->error == "" && $stmt_tel->error == ""){
            $retorno = ['status' => 'ok', 'mensagem' => 'Responsável atualizado com sucesso!'];
        } else {
            $retorno['mensagem'] = 'Erro ao atualizar: ' . $conexao->error;
        }

        $stmt->close();
        $stmt_tel->close();
    } else {
        $retorno['mensagem'] = 'ID não informado.';
    }
        
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>