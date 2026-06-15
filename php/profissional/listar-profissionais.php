<?php
    include_once('../conexao.php'); 

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum profissional de saúde encontrado', 'data' => []];

    if (!$conexao) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão com o banco de dados']);
        exit;
    }

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        
        // CORREÇÃO 1: Os documentos estão na tabela Documentacao (D) e o nome correto é certificacao_profissional
        $sql = "SELECT 
                    U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                    D.carteira_identidade_nacional, D.certificacao_profissional, P.registro_profissional, P.especialidade,
                    D.status_aprovacao, D.motivo_reprovacao
                FROM Usuario U
                INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
                LEFT JOIN Documentacao D ON U.id_usuario = D.id_usuario
                WHERE U.id_usuario = ?
                ORDER BY D.data_envio DESC LIMIT 1"; 
        
        $stmt = $conexao->prepare($sql);
        
        // Trava de segurança: Se o SQL estiver errado, o PHP avisa o motivo exato em vez de quebrar a tela
        if (!$stmt) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados (SQL): ' . $conexao->error]);
            exit;
        }
        
        $stmt->bind_param("i", $id);
    } else {
            //TESTE DE AUTORIA: Inserir novo campo abaixo, exemplo:  $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, P.especialidade, P.nome_campo, P.registro_profissional, 
       $sql = "SELECT 
                U.id_usuario, U.nome, U.email, U.telefone, 
                P.registro_profissional, P.especialidade, 
                P.local_atendimento, P.resumo_curriculo, P.data_formacao, P.anos_experiencia, P.valor_consulta
            FROM Usuario U
            INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
            WHERE U.tipo_usuario = 'ProfissionalSaude'
            ORDER BY U.nome ASC";

        //Colocar embaixo do outro SELECT
        //(SELECT D.ano_emissao FROM Documentacao D WHERE D.id_usuario = U.id_usuario ORDER BY D.data_envio DESC LIMIT 1) as ano_emissao

        
        $stmt = $conexao->prepare($sql);
        
        if (!$stmt) {
            echo json_encode(['status' => 'erro', 'mensagem' => 'Erro no banco de dados (SQL): ' . $conexao->error]);
            exit;
        }
    }

    if ($stmt->execute()) {
        $resultado = $stmt->get_result();
        $tabela = [];

        while ($linha = $resultado->fetch_assoc()) {
            // CORREÇÃO 2: Removemos as imagens (BLOBs) do array antes de converter para JSON.
            // Isso impede que o PHP trave por falta de memória ou erro de codificação UTF-8.
            unset($linha['carteira_identidade_nacional']);
            unset($linha['certificacao_profissional']);
            
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