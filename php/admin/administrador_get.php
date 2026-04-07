<?php
    include_once('../conexao.php'); 

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum administrador encontrado', 'data' => []];

    if (!$conexao) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão']);
        exit;
    }

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT 
                    U.id_usuario, 
                    U.nome, 
                    U.email, 
                    U.cpf,
                    U.data_nascimento, 
                    A.status_adm
                FROM Usuario U
                INNER JOIN Administrador A ON U.id_usuario = A.id_usuario
                WHERE U.id_usuario = ?"; // Filtro por ID
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $id);
    } else {
        $sql = "SELECT 
                    U.id_usuario, 
                    U.nome, 
                    U.email, 
                    U.cpf,
                    U.data_nascimento, 
                    A.status_adm
                FROM Usuario U
                INNER JOIN Administrador A ON U.id_usuario = A.id_usuario
                WHERE U.tipo_usuario = 'Administrador'
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