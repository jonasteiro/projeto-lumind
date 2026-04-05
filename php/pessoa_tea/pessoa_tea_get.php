<?php
    ob_start();
    include_once('../conexao.php'); // Verifique se o caminho está correto (../)

    $retorno = ['status' => 'nok', 'mensagem' => 'Registro não encontrado', 'data' => []];

    // Se houver ID, busca os dados completos para o formulário de edição
    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        
        $sql = "SELECT 
                    U.id_usuario, 
                    U.nome, 
                    U.email, 
                    U.cpf, 
                    U.data_nascimento, -- Coluna faltante 1
                    P.nivel_tea, 
                    P.observacao      -- Coluna faltante 2
                FROM Usuario U
                INNER JOIN PessoaTea P ON U.id_usuario = P.id_usuario
                WHERE U.id_usuario = ? AND U.tipo_usuario = 'PessoaTea'";
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0){
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Sucesso',
                'data' => [$resultado->fetch_assoc()]
            ];
        }
    }

    $conexao->close();
    ob_clean();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>