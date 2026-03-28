<?php
    include_once('conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];


    //Crição do USUÁRIO
    $nome            = $_POST['nome'];
    $email           = $_POST['email'];
    $senha           = $_POST['senha'];
    $data_nascimento = $_POST['data_nascimento'];
    $telefone        = $_POST['telefone'];

    //Criação do PROFISSIONAL
    $especialidade         = $_POST['especialidade'];
    $registro_profissional = $_POST['registro_profissional'];

    //Deixei a documentação em comentário porque fica bem confusa e não sei se é a melhor maneira
    /*
    $cip_conteudo = null;
    $cin_conteudo = null;
    */

    //Fazendo uma transaction para que ele crie tanto o usuario quanto o profissional simultaneamente
    //Assim se der erro em uma das partes nenhuma delas é salva como "fantasma"
    $conexao->begin_transaction();

    try {
        //Inserção do usuário (padrão)
        $stmt_usuario = $conexao->prepare("INSERT INTO Usuario (nome, email, senha, data_nascimento, telefone) VALUES (?, ?, ?, ?, ?)");
        $stmt_usuario->bind_param("sssss", $nome, $email, $senha, $data_nascimento, $telefone);
        $stmt_usuario->execute();

        //Variável que resgata o id de usuario que foi criada agora pra ser a fk do profissional que vai ser criado
        $id_usuario_gerado = $stmt_usuario->insert_id;
        //Se dar close no stmt usuario antes perde o id e nao consegue armazenar na variavel
        $stmt_usuario->close();

        //Inserção do profissional de saúde
        $stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, especialidade, registro_profissional) VALUES (?, ?, ?)");
        $stmt_prof->bind_param("iss", $id_usuario_gerado, $especialidade, $registro_profissional);
        $stmt_prof->execute();
        $stmt_prof->close();

        //Inserção da documentação
        //bind_param com ss pois ele vai armazenar o blob como uma string
        /*
        $stmt_doc = $conexao->prepare("INSERT INTO Documentacao (id_usuario, cip, cin) VALUES (?, ?, ?)");
        $stmt_doc->bind_param("iss", $id_usuario_gerado, $cip_conteudo, $cin_conteudo);
        $stmt_doc->execute();
        $stmt_doc->close();
        */

        //commit no bd se der certo nos dois
        $conexao->commit();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Profissional e documentação registrados com sucesso!',
            'data' => []
        ];

    } catch (Exception $excecao) { //Ativa o else quando reconhece a exception
        // Se der erro em qualquer um dos 3 passos vai cancelar os 3
        $conexao->rollback();
        
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao inserir o registro: ' . $excecao->getMessage(),
            'data' => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>