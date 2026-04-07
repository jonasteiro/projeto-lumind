<?php
include_once('../conexao.php');

$id = $_GET['id'] ?? 0;
$tipo = $_GET['tipo'] ?? ''; 

if ($id > 0 && ($tipo == 'cert' || $tipo == 'iden')) {
    $coluna = ($tipo == 'cert') ? 'certificacao_profissional' : 'carteira_identidade_nacional';
    
    $stmt = $conexao->prepare("SELECT $coluna FROM Documentacao WHERE id_usuario = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($binario);
    $stmt->fetch();

    if ($binario) {
        // Detecta automaticamente o tipo de arquivo
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($binario);

        header("Content-Type: $mimeType");
        echo $binario;
        exit;
    }
}

echo "Arquivo não localizado.";
?>