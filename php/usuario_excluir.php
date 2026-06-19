<?php
    ob_start();
    include_once('conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao excluir'];

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);

        try {
            // Inicia uma transação: ou apaga TUDO, ou não apaga NADA.
            $conexao->begin_transaction();

            // 1. Limpar vínculos de Atividades com Pacientes (Netos)
            $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_atividade IN (SELECT id_atividade FROM Atividade WHERE id_profissional = $id)");

            // 2. Limpar as Atividades do Profissional (Filhos)
            $conexao->query("DELETE FROM Atividade WHERE id_profissional = $id");

            // 3. Limpar Relatórios dos pacientes vinculados a esse profissional
            $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea IN (SELECT id_usuario FROM PessoaTea WHERE id_profissional = $id)");

            // 4. Limpar vínculos de Eventos dos pacientes
            $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea IN (SELECT id_usuario FROM PessoaTea WHERE id_profissional = $id)");

            // 5. Excluir os Pacientes (PessoaTea) do profissional
            $conexao->query("DELETE FROM PessoaTea WHERE id_profissional = $id");

            // 6. Excluir os Responsáveis Legais vinculados ao profissional
            $conexao->query("DELETE FROM ResponsavelLegal WHERE id_profissional = $id");

            // ====================================================================
            // CORREÇÃO DO ERRO DA CAPTURA DE TELA (FOREIGN KEY id_admin_revisor)
            // ====================================================================
            // Antes de excluir o administrador, desvinculamos ele de todas as 
            // documentações que ele revisou, setando o campo revisor para NULL.
            $conexao->query("UPDATE Documentacao SET id_admin_revisor = NULL WHERE id_admin_revisor = $id");
            // ====================================================================

            // 7. Limpar tabelas genéricas que usam id_usuario (Documentos, Telefones e Perfis)
            $tabelas_filhas = ['Documentacao', 'Telefone', 'Administrador', 'ProfissionalSaude'];
            foreach ($tabelas_filhas as $tabela) {
                $conexao->query("DELETE FROM $tabela WHERE id_usuario = $id");
            }

            // 8. Por fim, excluir o Usuário Mestre (O Pai de todos)
            $stmt = $conexao->prepare("DELETE FROM Usuario WHERE id_usuario = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                // Se deu tudo certo, confirma as exclusões no banco!
                $conexao->commit();
                $retorno = [
                    'status' => 'ok',
                    'mensagem' => 'Usuário e todos os seus vínculos foram excluídos com sucesso!'
                ];
            } else {
                // Se não achou o usuário principal, desfaz tudo
                $conexao->rollback();
                $retorno['mensagem'] = 'Registro não encontrado ou já excluído.';
            }
            $stmt->close();

        } catch (Exception $e) {
            // Se o banco barrar alguma coisa, desfazemos tudo e avisamos
            $conexao->rollback();
            $retorno['mensagem'] = 'Erro de restrição do banco: ' . $e->getMessage();
        }
    } else {
        $retorno['mensagem'] = 'ID não fornecido.';
    }

    $conexao->close();
    ob_clean();
    
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>