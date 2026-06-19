<?php
    ob_start();
    include_once('conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao excluir'];

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);

        try {
            // Inicia uma transação: ou apaga TUDO, ou não apaga NADA.
            $conexao->begin_transaction();

            // ====================================================================
            // 1. DESCOBRIR QUE TIPO DE PESSOA ESTAMOS EXCLUINDO
            // ====================================================================
            $tipo_usuario = 'Desconhecido';
            
            // Verifica se é um Paciente (PessoaTea)
            $checaPaciente = $conexao->query("SELECT id_usuario FROM PessoaTea WHERE id_usuario = $id");
            if ($checaPaciente->num_rows > 0) {
                $tipo_usuario = 'Paciente';
            } else {
                // Verifica se é um Usuário Pai (Profissional, Responsavel ou Admin)
                $checaUsuarioPai = $conexao->query("SELECT id_usuario FROM Usuario WHERE id_usuario = $id");
                if ($checaUsuarioPai->num_rows > 0) {
                    $tipo_usuario = 'UsuarioPai';
                }
            }

            // ====================================================================
            // 2. FLUXO DE EXCLUSÃO DE PACIENTE (TEA)
            // ====================================================================
            if ($tipo_usuario === 'Paciente') {
                
                // 1. Deleta os vínculos do Paciente com as Atividades
                $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_pessoa_tea = $id");
                
                // 2. Deleta os vínculos do Paciente com Eventos
                $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea = $id");
                
                // 3. Deleta os Relatórios do Paciente
                $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea = $id");
                
                // 4. Deleta o Paciente
                $stmt = $conexao->prepare("DELETE FROM PessoaTea WHERE id_usuario = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $linhas_afetadas = $stmt->affected_rows;
                $stmt->close();

                if ($linhas_afetadas > 0) {
                    $conexao->commit();
                    $retorno = ['status' => 'ok', 'mensagem' => 'Paciente e seus históricos foram excluídos com sucesso!'];
                } else {
                    $conexao->rollback();
                    $retorno['mensagem'] = 'Paciente não encontrado ou já excluído.';
                }
            }
            // ====================================================================
            // 3. FLUXO DE EXCLUSÃO DE USUÁRIO PAI (PROFISSIONAL OU ADMIN)
            // ====================================================================
            else if ($tipo_usuario === 'UsuarioPai') {
                
                // Limpar vínculos de Atividades com Pacientes (Netos)
                $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_atividade IN (SELECT id_atividade FROM Atividade WHERE id_profissional = $id)");

                // Limpar as Atividades do Profissional (Filhos)
                $conexao->query("DELETE FROM Atividade WHERE id_profissional = $id");

                // Limpar Relatórios dos pacientes vinculados a esse profissional
                $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea IN (SELECT id_usuario FROM PessoaTea WHERE id_profissional = $id)");

                // Limpar vínculos de Eventos dos pacientes do profissional
                $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea IN (SELECT id_usuario FROM PessoaTea WHERE id_profissional = $id)");

                // Excluir os Pacientes (PessoaTea) atrelados a este profissional
                $conexao->query("DELETE FROM PessoaTea WHERE id_profissional = $id");

                // Excluir os Responsáveis Legais vinculados ao profissional
                $conexao->query("DELETE FROM ResponsavelLegal WHERE id_profissional = $id");

                // Antes de excluir o administrador, setar a revisão como NULL para manter o histórico da documentação
                $conexao->query("UPDATE Documentacao SET id_admin_revisor = NULL WHERE id_admin_revisor = $id");

                // Limpar tabelas genéricas que usam id_usuario
                $tabelas_filhas = ['Documentacao', 'Telefone', 'Administrador', 'ProfissionalSaude'];
                foreach ($tabelas_filhas as $tabela) {
                    $conexao->query("DELETE FROM $tabela WHERE id_usuario = $id");
                }

                // Por fim, excluir o Usuário Mestre (O Pai de todos)
                $stmt = $conexao->prepare("DELETE FROM Usuario WHERE id_usuario = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $linhas_afetadas = $stmt->affected_rows;
                $stmt->close();

                if ($linhas_afetadas > 0) {
                    $conexao->commit();
                    $retorno = ['status' => 'ok', 'mensagem' => 'Usuário e todos os seus vínculos foram excluídos com sucesso!'];
                } else {
                    $conexao->rollback();
                    $retorno['mensagem'] = 'Registro não encontrado ou já excluído.';
                }
            } else {
                $conexao->rollback();
                $retorno['mensagem'] = 'Tipo de usuário não identificado para exclusão.';
            }

        } catch (Exception $e) {
            // Se o banco barrar alguma coisa, desfazemos tudo e avisamos
            $conexao->rollback();
            $retorno['mensagem'] = 'O banco de dados impediu a exclusão porque este cadastro possui históricos importantes vinculados.';
            // Opcional para debug: $retorno['mensagem'] = $e->getMessage();
        }
    } else {
        $retorno['mensagem'] = 'ID não fornecido.';
    }

    $conexao->close();
    ob_clean();
    
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>