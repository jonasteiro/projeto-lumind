<?php
    include_once('../conexao.php'); // Sobe um nível para achar a conexão

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum administrador encontrado', 'data' => []];

    if (!$conexao) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão']);
        exit;
    }

    // Query para buscar TODOS os administradores
    $sql = "SELECT 
                U.id_usuario, 
                U.nome, 
                U.email, 
                U.cpf, 
                A.status_adm
            FROM Usuario U
            INNER JOIN Administrador A ON U.id_usuario = A.id_usuario
            WHERE U.tipo_usuario = 'Administrador'
            ORDER BY U.nome ASC";

    $stmt = $conexao->prepare($sql);

    if($stmt->execute()){
        $resultado = $stmt->get_result();
        $tabela = [];

        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        if(count($tabela) > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Sucesso',
                'data'      => $tabela
            ];
        }
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>