<?php
    // 1. Inicia a sessão para podermos pegar o ID do profissional
    session_start();
    include_once('../conexao.php');

    $retorno = ['status' => 'nok', 'mensagem' => 'Nenhum registro encontrado', 'data' => []];

    // 2. Resgata o ID do profissional logado
    $id_profissional_logado = $_SESSION['usuario']['id_usuario'] ?? null;

    // Trava de segurança extra: se ninguém estiver logado, barra a requisição
    if (!$id_profissional_logado) {
        $retorno['mensagem'] = 'Acesso negado. Profissional não autenticado.';
        header("Content-type:application/json;charset=utf-8");
        echo json_encode($retorno);
        exit;
    }

    // Se houver ID na URL, filtra pelo usuário específico E garante que pertence a este profissional
    if(isset($_GET['id']) && !empty($_GET['id'])){
        $id = intval($_GET['id']);
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, T.telefone
                FROM Usuario U
                INNER JOIN ResponsavelLegal R ON U.id_usuario = R.id_usuario
                LEFT JOIN Telefone T ON U.id_usuario = T.id_usuario
                WHERE U.id_usuario = ? AND U.tipo_usuario = 'ResponsavelLegal' AND R.id_profissional = ?";
                
        $stmt = $conexao->prepare($sql);
        // "ii" significa que estamos passando dois inteiros: o ID buscado e o ID do profissional
        $stmt->bind_param("ii", $id, $id_profissional_logado);
        
    } else {
        // Se não houver ID, lista TODOS os responsáveis, mas APENAS os atrelados a este profissional
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, T.telefone
                FROM Usuario U
                INNER JOIN ResponsavelLegal R ON U.id_usuario = R.id_usuario
                LEFT JOIN Telefone T ON U.id_usuario = T.id_usuario
                WHERE U.tipo_usuario = 'ResponsavelLegal' AND R.id_profissional = ?
                ORDER BY U.nome ASC";
                
        $stmt = $conexao->prepare($sql);
        // "i" significa que estamos passando um inteiro: o ID do profissional
        $stmt->bind_param("i", $id_profissional_logado);
    }

    if($stmt->execute()){
        $resultado = $stmt->get_result();
        $tabela = [];
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }
        if(count($tabela) > 0){
            $retorno = ['status' => 'ok', 'mensagem' => 'Sucesso', 'data' => $tabela];
        }
    }

    $stmt->close();
    $conexao->close();
    
    // Corrigi um pequeno detalhe aqui: charset=utf-8 (usando igual ao invés de dois pontos)
    header("Content-type:application/json;charset=utf-8");
    echo json_encode($retorno);
?>
