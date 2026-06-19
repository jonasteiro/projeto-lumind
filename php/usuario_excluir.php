<?php
    ob_start();
    include_once('conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao excluir'];

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);

        try {
            $conexao->begin_transaction();

            // ====================================================================
            // 1. DESCOBRIR O TIPO EXATO DE USUÁRIO
            // ====================================================================
            $tipo_usuario = 'Desconhecido';
            
            if ($conexao->query("SELECT id_usuario FROM Administrador WHERE id_usuario = $id")->num_rows > 0) {
                $tipo_usuario = 'Administrador';
            } elseif ($conexao->query("SELECT id_usuario FROM ProfissionalSaude WHERE id_usuario = $id")->num_rows > 0) {
                $tipo_usuario = 'Profissional';
            } elseif ($conexao->query("SELECT id_usuario FROM ResponsavelLegal WHERE id_usuario = $id")->num_rows > 0) {
                $tipo_usuario = 'Responsavel';
            } elseif ($conexao->query("SELECT id_usuario FROM PessoaTea WHERE id_usuario = $id")->num_rows > 0) {
                $tipo_usuario = 'Paciente';
            }

            // ====================================================================
            // 2. FLUXO DE EXCLUSÃO DE PACIENTE (PessoaTea)
            // ====================================================================
            if ($tipo_usuario === 'Paciente') {
                $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_pessoa_tea = $id");
                $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea = $id");
                $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea = $id");
                $conexao->query("DELETE FROM PessoaTea WHERE id_usuario = $id");
            }
            
            // ====================================================================
            // 3. FLUXO DE EXCLUSÃO DE RESPONSÁVEL LEGAL
            // ====================================================================
            elseif ($tipo_usuario === 'Responsavel') {
                // CORREÇÃO DO ERRO: Limpa os pacientes "órfãos" que dependiam desse responsável
                $pacientes = $conexao->query("SELECT id_usuario FROM PessoaTea WHERE id_responsavel = $id");
                while ($pac = $pacientes->fetch_assoc()) {
                    $id_pac = $pac['id_usuario'];
                    $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_pessoa_tea = $id_pac");
                    $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea = $id_pac");
                    $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea = $id_pac");
                }
                
                // Agora que o histórico acabou, apaga o paciente e em seguida o responsável
                $conexao->query("DELETE FROM PessoaTea WHERE id_responsavel = $id");
                $conexao->query("DELETE FROM ResponsavelLegal WHERE id_usuario = $id");
            }
            
            // ====================================================================
            // 4. FLUXO DE EXCLUSÃO DE PROFISSIONAL DE SAÚDE
            // ====================================================================
            elseif ($tipo_usuario === 'Profissional') {
                // Limpa as atividades geradas por esse profissional
                $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_atividade IN (SELECT id_atividade FROM Atividade WHERE id_profissional = $id)");
                $conexao->query("DELETE FROM Atividade WHERE id_profissional = $id");

                // Limpa os pacientes amarrados ao profissional
                $pacientes = $conexao->query("SELECT id_usuario FROM PessoaTea WHERE id_profissional = $id");
                while ($pac = $pacientes->fetch_assoc()) {
                    $id_pac = $pac['id_usuario'];
                    $conexao->query("DELETE FROM PessoaTea_Atividade WHERE id_pessoa_tea = $id_pac");
                    $conexao->query("DELETE FROM PessoaTea_Evento WHERE id_pessoa_tea = $id_pac");
                    $conexao->query("DELETE FROM Relatorio WHERE id_pessoa_tea = $id_pac");
                }
                
                // Apaga os registros atrelados
                $conexao->query("DELETE FROM PessoaTea WHERE id_profissional = $id");
                $conexao->query("DELETE FROM ResponsavelLegal WHERE id_profissional = $id");
                $conexao->query("DELETE FROM ProfissionalSaude WHERE id_usuario = $id");
            }
            
            // ====================================================================
            // 5. FLUXO DE EXCLUSÃO DE ADMINISTRADOR
            // ====================================================================
            elseif ($tipo_usuario === 'Administrador') {
                $conexao->query("UPDATE Documentacao SET id_admin_revisor = NULL WHERE id_admin_revisor = $id");
                $conexao->query("DELETE FROM Administrador WHERE id_usuario = $id");
            }

            // ====================================================================
            // 6. LIMPEZA FINAL (GENÉRICA PARA TODOS OS USUÁRIOS)
            // ====================================================================
            if ($tipo_usuario !== 'Desconhecido') {
                
                // Limpa os dados de apoio do sistema
                $conexao->query("DELETE FROM Documentacao WHERE id_usuario = $id");
                $conexao->query("DELETE FROM Telefone WHERE id_usuario = $id");

                // O Grand Finale: Apaga o "Usuário Pai"
                $stmt = $conexao->prepare("DELETE FROM Usuario WHERE id_usuario = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $linhas_afetadas = $stmt->affected_rows;
                $stmt->close();

                if ($linhas_afetadas > 0) {
                    $conexao->commit();
                    $retorno = ['status' => 'ok', 'mensagem' => 'O usuário e todos os seus vínculos foram excluídos com sucesso!'];
                } else {
                    $conexao->rollback();
                    $retorno['mensagem'] = 'Registro não encontrado ou já excluído.';
                }
            } else {
                $conexao->rollback();
                $retorno['mensagem'] = 'Tipo de usuário não identificado para exclusão.';
            }

        } catch (mysqli_sql_exception $e) {
            $conexao->rollback();
            $retorno['mensagem'] = 'ERRO DO BANCO: ' . $e->getMessage();
        } catch (Exception $e) {
            $conexao->rollback();
            $retorno['mensagem'] = 'ERRO GERAL: ' . $e->getMessage();
        }
    } else {
        $retorno['mensagem'] = 'ID não fornecido.';
    }

    $conexao->close();
    ob_clean();
    
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>