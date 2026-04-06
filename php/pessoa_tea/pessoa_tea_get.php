<?php
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum registro encontrado', 'data' => []];

    // Se houver ID, busca UM específico. Se não, busca TODOS.
    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao 
                FROM Usuario U
                INNER JOIN PessoaTea P ON U.id_usuario = P.id_usuario
                WHERE U.id_usuario = ? AND U.tipo_usuario = 'PessoaTea'";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $id);
    } else {
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao 
                FROM Usuario U
                INNER JOIN PessoaTea P ON U.id_usuario = P.id_usuario
                WHERE U.tipo_usuario = 'PessoaTea'
                ORDER BY U.nome ASC";
        $stmt = $conexao->prepare($sql);
    }

    if($stmt->execute()){
        $resultado = $stmt->get_result();
        $tabela = [];
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }
        if(count($tabela) > 0){
            $retorno = ['status' => 'ok', 'mensagem' => 'Sucesso', 'data' => $tabela];
        }
    }

    $stmt->close();
    $conexao->close();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>