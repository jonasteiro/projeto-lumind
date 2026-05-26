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
    $stmt->close();

    if ($binario) {
        
        // ==============================================================
        // PROTEÇÃO: TRATAMENTO PARA DADOS DE TESTE (MOCK DATA) DO SQL
        // ==============================================================
        $dados_falsos = ['blob_cert_novo', 'blob_rg_novo', 'blob_cert', 'blob_rg', 'blob_cert_borrado', 'blob_rg_vencido'];
        
        if (in_array($binario, $dados_falsos)) {
            echo "<div style='font-family: Inter, Arial, sans-serif; text-align: center; padding: 60px 20px; color: #334155; background-color: #f8fcff; height: 100vh; margin: 0; box-sizing: border-box;'>";
            echo "<h2 style='color: #0284c7; margin-bottom: 10px;'>Modo de Teste</h2>";
            echo "<p style='font-size: 1.1rem;'>O banco de dados retornou o texto fictício: <strong style='background: #e0f2fe; padding: 4px 8px; border-radius: 4px; color: #0369a1;'>" . htmlspecialchars($binario) . "</strong></p>";
            echo "<p style='color: #64748b; font-size: 0.9rem; mt-3'>Para ver um documento real, faça o upload de um PDF ou Imagem pelo sistema.</p>";
            echo "</div>";
            exit;
        }
        // ==============================================================

        // Detecta automaticamente o tipo de arquivo real
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($binario);

        if (!$mimeType || $mimeType === 'application/x-empty') {
            $mimeType = 'application/pdf'; 
        }

        header("Content-Type: $mimeType");
        echo $binario;
        exit;
    }
}

echo "<div style='font-family: Inter, Arial, sans-serif; text-align: center; padding: 60px 20px; color: #dc3545; background-color: #fff5f5; height: 100vh; margin: 0;'>";
echo "<h3>Documento não localizado no banco de dados.</h3>";
echo "</div>";
?>