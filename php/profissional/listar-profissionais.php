<?php
    include_once('../conexao.php'); 

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum profissional de saúde encontrado', 'data' => []];

    if (!$conexao) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão com o banco de dados']);
        exit;
    }

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        
        $sql = "SELECT 
                    U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                    P.carteira_identidade_nacional, P.certificado_profissional, P.registro_profissional, P.especialidade,
                    D.status_aprovacao, D.motivo_reprovacao
                FROM Usuario U
                INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
                LEFT JOIN Documentacao D ON U.id_usuario = D.id_usuario
                WHERE U.id_usuario = ?
                ORDER BY D.data_envio DESC LIMIT 1"; 
        
        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $id);
    } else {
        // Usando subquery para buscar o último status sem causar erro de GROUP BY no MySQL
        $sql = "SELECT 
                    U.id_usuario, U.nome, U.email, U.cpf, 
                    P.especialidade, P.registro_profissional,
                    (SELECT D.status_aprovacao FROM Documentacao D WHERE D.id_usuario = U.id_usuario ORDER BY D.data_envio DESC LIMIT 1) as status_aprovacao
                FROM Usuario U
                INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
                WHERE U.tipo_usuario = 'ProfissionalSaude'
                ORDER BY U.nome ASC";
        
        $stmt = $conexao->prepare($sql);
    }

    if ($stmt->execute()) {
        $resultado = $stmt->get_result();
        $tabela = [];

        while ($linha = $resultado->fetch_assoc()) {
            $tabela[] = $linha;
        }

        if (count($tabela) > 0) {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Sucesso',
                'data'      => $tabela
            ];
        }
    } else {
        $retorno = [
            'status'   => 'erro',
            'mensagem' => 'Falha na execução da consulta SQL: ' . $stmt->error
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>