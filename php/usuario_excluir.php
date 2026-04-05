<?php
    ob_start();
    include_once('conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao excluir'];

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);

        // 1. Limpamos as tabelas filhas primeiro (Caso o banco não tenha CASCADE)
        // Isso garante que não dê erro de chave estrangeira
        $tabelas_filhas = ['Administrador', 'ResponsavelLegal', 'PessoaTea', 'Telefone', 'ProfissionalSaude'];
        
        foreach ($tabelas_filhas as $tabela) {
            $sql_filha = "DELETE FROM $tabela WHERE id_usuario = ?";
            $stmt_filha = $conexao->prepare($sql_filha);
            $stmt_filha->bind_param("i", $id);
            $stmt_filha->execute();
        }

        // 2. Agora excluímos o usuário da tabela principal
        $stmt = $conexao->prepare("DELETE FROM Usuario WHERE id_usuario = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                $retorno = [
                    'status' => 'ok',
                    'mensagem' => 'Registro excluído com sucesso!'
                ];
            } else {
                $retorno['mensagem'] = 'Registro não encontrado.';
            }
        } else {
            $retorno['mensagem'] = 'Erro no banco: ' . $conexao->error;
        }
        
        $stmt->close();
    } else {
        $retorno['mensagem'] = 'ID não fornecido.';
    }

    $conexao->close();
    ob_clean();
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>