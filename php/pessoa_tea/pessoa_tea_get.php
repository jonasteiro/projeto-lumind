<?php
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Não há registros', 'data' => []];

    // Busca TODOS os pacientes (Usuario + PessoaTea)
    $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, P.nivel_tea 
            FROM Usuario U 
            INNER JOIN PessoaTea P ON U.id_usuario = P.id_usuario 
            WHERE U.tipo_usuario = 'PessoaTea' 
            ORDER BY U.nome ASC";

    $stmt = $conexao->prepare($sql);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso',
            'data'      => $tabela
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>