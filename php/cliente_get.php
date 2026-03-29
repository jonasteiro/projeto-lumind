<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $sql = "
    SELECT 
        c.id,
        c.nome,
        c.email,
        c.usuario,
        c.nivel,
        c.ativo,
        c.instagram,
        p.especialidade,
        p.registro_profissional,
        p.telefone as telefone_profissional,
        p.data_nascimento,
        r.telefone as telefone_responsavel,
        t.data_diagnostico,
        t.nivel_autismo
    FROM cliente c
    LEFT JOIN profissional p ON c.id = p.cliente_id
    LEFT JOIN responsavel r ON c.id = r.cliente_id
    LEFT JOIN pessoa_tea t ON c.id = t.cliente_id
    ";

    if(isset($_GET['id'])){
        // Buscar um cliente específico
        $sql .= " WHERE c.id = ?";
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $_GET['id']);
    } else {
        // Buscar todos os clientes
        $stmt = $conexao->prepare($sql);
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];

    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso, consulta efetuada.',
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);