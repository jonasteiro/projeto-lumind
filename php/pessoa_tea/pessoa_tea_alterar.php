<?php
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => ''];

    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        $nome = $_POST['nome'];
        $email = $_POST['email'];
        $cpf = $_POST['cpf'];
        $nivel_tea = $_POST['nivel_tea'];
        $observacao = $_POST['observacao'];
        $data_nascimento = $_POST['data_nascimento'];
        $senha = $_POST['senha'];

        // 1. UPDATE USUARIO
        if(!empty($senha)){
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, senha = ? WHERE id_usuario = ?");
            $stmt->bind_param("sssssi", $nome, $email, $cpf, $data_nascimento, $senha, $id);
        } else {
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_usuario = ?");
            $stmt->bind_param("ssssi", $nome, $email, $cpf, $data_nascimento, $id);
        }
        $stmt->execute();

        // 2. UPDATE PESSOA TEA
        $stmt_tea = $conexao->prepare("UPDATE PessoaTea SET nivel_tea = ?, observacao = ? WHERE id_usuario = ?");
        $stmt_tea->bind_param("ssi", $nivel_tea, $observacao, $id);
        $stmt_tea->execute();

        if($stmt->error == "" && $stmt_tea->error == ""){
            $retorno = ['status' => 'ok', 'mensagem' => 'Dados da Pessoa TEA atualizados!'];
        } else {
            $retorno['mensagem'] = 'Erro ao atualizar: ' . $conexao->error;
        }

        $stmt->close();
        $stmt_tea->close();
    } else {
        $retorno['mensagem'] = 'ID não informado.';
    }
        
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>