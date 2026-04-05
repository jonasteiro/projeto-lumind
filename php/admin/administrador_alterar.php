<?php
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => ''];

    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        $nome = $_POST['nome'];
        $email = $_POST['email'];
        $cpf = $_POST['cpf'];
        $data_nascimento = $_POST['data_nascimento'];
        $senha = $_POST['senha'];
        $status_adm = (int) $_POST['status_adm'];

        // Validação básica servidor (Double Check)
        if(empty($nome) || empty($email) || strlen($cpf) != 11){
            echo json_encode(['status' => 'nok', 'mensagem' => 'Dados inválidos enviados.']);
            exit;
        }

        // UPDATE TABELA USUARIO
        if(!empty($senha)){
            // Se informou senha, atualiza ela também (ideal usar password_hash aqui no futuro)
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, senha = ? WHERE id_usuario = ?");
            $stmt->bind_param("sssssi", $nome, $email, $cpf, $data_nascimento, $senha, $id);
        } else {
            // Se senha vazia, mantém a que já existe
            $stmt = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_usuario = ?");
            $stmt->bind_param("ssssi", $nome, $email, $cpf, $data_nascimento, $id);
        }
        
        $stmt->execute();

        // UPDATE TABELA ADMINISTRADOR
        $stmt_adm = $conexao->prepare("UPDATE Administrador SET status_adm = ? WHERE id_usuario = ?");
        $stmt_adm->bind_param("ii", $status_adm, $id);
        $stmt_adm->execute();

        if($stmt->error == "" && $stmt_adm->error == ""){
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Dados do administrador atualizados com sucesso!'
            ];
        } else {
            $retorno['mensagem'] = 'Erro ao atualizar: ' . $conexao->error;
        }

        $stmt->close();
        $stmt_adm->close();
    } else {
        $retorno['mensagem'] = 'ID inválido ou não informado.';
    }
        
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>