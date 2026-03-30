<?php
    include_once('conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_POST['id'])){
        $id         = $_POST['id'];
        $nome       = $_POST['nome'];
        $email      = $_POST['email'];
        $usuario    = $_POST['usuario'];
        // $senha      = $_POST['senha']; // Só altere senha se for necessário!
        $ativo      = (int) $_POST['ativo'];

        // Atualiza também o nível, se vier do front
        $nivel      = isset($_POST['nivel']) ? $_POST['nivel'] : null;

        // Monta a query dinamicamente para incluir o campo nivel se enviado
        $sql = "UPDATE cliente SET nome = ?, email = ?, usuario = ?, ativo = ?";
        $params = [$nome, $email, $usuario, $ativo];
        $types = "sssi";

        if ($nivel !== null) {
            $sql .= ", nivel = ?";
            $params[] = $nivel;
            $types .= "s";
        }

        $sql .= " WHERE id = ?";
        $params[] = $id;
        $types .= "i";

        $stmt = $conexao->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Não foi possível alterar o registro (ID: '.$id.').',
                'data'      => []
            ];
        }
        $stmt->close();
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);