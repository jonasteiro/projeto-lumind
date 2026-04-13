<?php
    include_once('../conexao.php'); 

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum profissional encontrado.', 'data' => []];

    if (!$conexao) {
        echo json_encode(['status' => 'erro', 'mensagem' => 'Erro de conexão com o banco de dados.']);
        exit;
    }

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        
        // SELECT limpo: Sem as colunas de certificacao_profissional e carteira_identidade
        $sql = "SELECT 
                    U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                    P.registro_profissional, P.especialidade,
                    D.status_aprovacao, D.motivo_reprovacao
                FROM Usuario U
                INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
                LEFT JOIN Documentacao D ON U.id_usuario = D.id_usuario
                WHERE U.id_usuario = ?
                ORDER BY D.data_envio DESC LIMIT 1"; 
        
        $stmt = $conexao->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($linha = $resultado->fetch_assoc()) {
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Sucesso',
                    // Mandamos dentro de um array para o JS ler como resposta.data[0]
                    'data'      => [$linha] 
                ];
            } else {
                $retorno['mensagem'] = 'Profissional não encontrado no banco de dados.';
            }
            $stmt->close();
        } else {
            $retorno['mensagem'] = 'Erro ao montar a consulta: ' . $conexao->error;
        }
    } else {
        $retorno['mensagem'] = 'ID do usuário não foi enviado na URL.';
    }

    $conexao->close();

    header("Content-type: application/json; charset=utf-8");
    echo json_encode($retorno);
?>