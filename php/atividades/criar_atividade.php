<?php
header('Content-Type: application/json; charset=utf-8');
include_once('../conexao.php');
session_start();

// Validação de Sessão
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo_usuario'] !== 'ProfissionalSaude') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido. Use POST.']);
    exit;
}

$id_profissional = $_SESSION['usuario']['id_usuario'];

try {
    $conexao->begin_transaction();

    $titulo = $_POST['titulo'];
    $descricao = $_POST['descricao'];
    $categoria = $_POST['categoria'];
    $data_publicacao = $_POST['data_publicacao'];
    $pacientes_ids = $_POST['pacientes_ids'];
    // Tratamento dos 5 campos novos da Atividade
    $subtitulo_atividade = htmlspecialchars($_POST['subtitulo_atividade'] ?? '', ENT_QUOTES, 'UTF-8');
    $objetivos_terapeuticos = htmlspecialchars($_POST['objetivos_terapeuticos'] ?? '', ENT_QUOTES, 'UTF-8');
    $data_vencimento = !empty($_POST['data_vencimento']) ? $_POST['data_vencimento'] : null;
    $tempo_estimado_minutos = !empty($_POST['tempo_estimado_minutos']) ? (int) $_POST['tempo_estimado_minutos'] : null;

    // Conversão segura de FLOAT (Substitui vírgula brasileira por ponto decimal)
    $peso_bruto = !empty($_POST['peso_avaliacao']) ? $_POST['peso_avaliacao'] : '1.00';
    $peso_avaliacao = (float) str_replace(',', '.', $peso_bruto);

    //Adicionar variável
    //$novoCampo     = $_POST['novoCampo'];
    
    // Tratamento do Arquivo Anexo
    $arquivo_binario = null;
    $tipo_arquivo = null;
    if (isset($_FILES['arquivo']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK) {
        $arquivo_binario = file_get_contents($_FILES['arquivo']['tmp_name']);
        $tipo_arquivo = $_FILES['arquivo']['type'];
    }


    $sql_insert = "INSERT INTO Atividade (
                        id_profissional, titulo, descricao, data_publicacao, categoria, arquivo_anexo, tipo_arquivo, data_limite,
                        subtitulo_atividade, objetivos_terapeuticos, data_vencimento, tempo_estimado_minutos, peso_avaliacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                   
    $stmt = $conexao->prepare($sql_insert);
    
    // 👇 NOVA TRAVA DE SEGURANÇA! Se o banco der erro (ex: coluna não existe), ele avisa!
    if (!$stmt) {
        throw new Exception("Erro interno do Banco de Dados: " . $conexao->error);
    }
    
    $stmt->bind_param("issssssssssid", 
    $id_profissional, $titulo, $descricao, $data_publicacao, $categoria, $arquivo_binario, $tipo_arquivo, $data_limite,
    $subtitulo_atividade, $objetivos_terapeuticos, $data_vencimento, $tempo_estimado_minutos, $peso_avaliacao
);
    $stmt->execute();
    //Adicionar s,i ou d e o $nome da variável
    
    
    $id_atividade = $conexao->insert_id;
    $stmt->close();

    $sql_pivo = "INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade) VALUES (?, ?)";
    $stmt_pivo = $conexao->prepare($sql_pivo);
    foreach ($pacientes_ids as $id_paciente) {
        $stmt_pivo->bind_param("ii", $id_paciente, $id_atividade);
        $stmt_pivo->execute();
    }
    $stmt_pivo->close();

    $conexao->commit();
    echo json_encode(['status' => 'ok', 'mensagem' => 'Atividade criada com sucesso!']);

} catch (Exception $e) {
    $conexao->rollback();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao criar: ' . $e->getMessage()]);
}

$conexao->close();
?>