<?php
    include_once('../conexao.php');

    ini_set('display_errors', 0);
    error_reporting(E_ALL);

    $retorno = ['status' => 'nok', 'mensagem' => 'Dados inválidos ou incompletos.'];

    if(isset($_POST['id_usuario']) && !empty($_POST['id_usuario'])){
        
        $id = intval($_POST['id_usuario']);
        $nome = trim($_POST['nome'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $cpf = trim($_POST['cpf'] ?? '');
        $registro = trim($_POST['registro_profissional'] ?? '');
        $especialidade = trim($_POST['especialidade'] ?? '');
        $data_nascimento = $_POST['data_nascimento'] ?? '';
        $senha = $_POST['senha'] ?? '';

        // 1. Validação Básica
        if(empty($nome) || empty($email) || strlen($cpf) != 11 || empty($registro)){
            echo json_encode(['status' => 'nok', 'mensagem' => 'Preencha todos os campos obrigatórios.']);
            exit;
        }

        // 2. Validação dos Arquivos (Como é reenvio, são obrigatórios)
        if(isset($_FILES['certificacao_profissional']) && isset($_FILES['carteira_identidade_nacional']) && 
           $_FILES['certificacao_profissional']['error'] === UPLOAD_ERR_OK && 
           $_FILES['carteira_identidade_nacional']['error'] === UPLOAD_ERR_OK) {
            
            // Lendo os arquivos temporários para transformar em Binário (BLOB)
            $certificacao_bin = file_get_contents($_FILES['certificacao_profissional']['tmp_name']);
            $identidade_bin = file_get_contents($_FILES['carteira_identidade_nacional']['tmp_name']);

            // Inicia a Transação (Se der erro em uma tabela, cancela tudo)
            $conexao->begin_transaction();

            try {
                // --- ATUALIZAÇÃO 1: Tabela Usuario ---
                if(!empty($senha)){
                    // Nota: Se você usa password_hash() no cadastro, adicione-o aqui na variável $senha antes de salvar
                    $stmt_user = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ?, senha = ? WHERE id_usuario = ?");
                    $stmt_user->bind_param("sssssi", $nome, $email, $cpf, $data_nascimento, $senha, $id);
                } else {
                    $stmt_user = $conexao->prepare("UPDATE Usuario SET nome = ?, email = ?, cpf = ?, data_nascimento = ? WHERE id_usuario = ?");
                    $stmt_user->bind_param("ssssi", $nome, $email, $cpf, $data_nascimento, $id);
                }
                $stmt_user->execute();
                $stmt_user->close();

                // --- ATUALIZAÇÃO 2: Tabela ProfissionalSaude ---
                $stmt_prof = $conexao->prepare("UPDATE ProfissionalSaude SET registro_profissional = ?, especialidade = ? WHERE id_usuario = ?");
                $stmt_prof->bind_param("ssi", $registro, $especialidade, $id);
                $stmt_prof->execute();
                $stmt_prof->close();

                // --- ATUALIZAÇÃO 3: Tabela Documentacao (O Pulo do Gato) ---
                // Alteramos o status para Aguardando, limpamos o motivo e atualizamos os binários
                $sql_doc = "UPDATE Documentacao 
                            SET certificacao_profissional = ?, 
                                carteira_identidade_nacional = ?, 
                                status_aprovacao = 'Aguardando', 
                                motivo_reprovacao = NULL, 
                                data_envio = NOW(), 
                                id_admin_revisor = NULL, 
                                data_revisao = NULL 
                            WHERE id_usuario = ?";
                
                $stmt_doc = $conexao->prepare($sql_doc);
                
                // Usamos bind_param com 'b' (blob) e send_long_data para garantir que arquivos grandes não quebrem o limite do PHP
                $null = NULL;
                $stmt_doc->bind_param("bbi", $null, $null, $id);
                $stmt_doc->send_long_data(0, $certificacao_bin);
                $stmt_doc->send_long_data(1, $identidade_bin);
                $stmt_doc->execute();
                $stmt_doc->close();

                // Se chegou até aqui sem dar erro em nenhuma das 3 tabelas, SALVA AS MUDANÇAS!
                $conexao->commit();

                $retorno = [
                    'status' => 'ok',
                    'mensagem' => 'Documentação reenviada com sucesso!'
                ];

            } catch (Exception $e) {
                // Se der qualquer erro no meio do caminho, desfaz tudo
                $conexao->rollback();
                $retorno['mensagem'] = 'Erro ao processar as alterações no banco: ' . $e->getMessage();
            }

        } else {
            $retorno['mensagem'] = 'Você precisa enviar ambos os arquivos sem corrupção para prosseguir.';
        }
    } else {
        $retorno['mensagem'] = 'ID do usuário não foi reconhecido.';
    }

    $conexao->close();
    
    header("Content-type: application/json; charset=utf-8");
    echo json_encode($retorno);
?>