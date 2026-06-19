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

    if (!empty($binario)) {
        
        // ==============================================================
        // PROTEÇÃO: TRATAMENTO PARA DADOS DE TESTE (MOCK DATA)
        // ==============================================================
        $dados_falsos = ['blob_cert_novo', 'blob_rg_novo', 'blob_cert', 'blob_rg', 'blob_cert_borrado', 'blob_rg_vencido'];
        
        if (in_array($binario, $dados_falsos)) {
            // Nova tela amigável para dados de teste
            echo "<div style='font-family: Inter, Arial, sans-serif; text-align: center; padding: 40px 20px; color: #64748b; background-color: #f8fafc; height: 100vh; margin: 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;'>";
            echo "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' fill='currentColor' style='color: #94a3b8; margin-bottom: 15px;' viewBox='0 0 16 16'><path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/><path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z'/></svg>";
            echo "<h3 style='color: #334155; margin-bottom: 8px; font-weight: 600;'>Perfil de Demonstração</h3>";
            echo "<p style='font-size: 0.95rem; max-width: 320px; line-height: 1.5;'>Este profissional foi gerado para testes e não possui um documento real anexado.</p>";
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

// MENSAGEM AMIGÁVEL CASO O ARQUIVO NÃO EXISTA (NULL/VAZIO)
echo "<div style='font-family: Inter, Arial, sans-serif; text-align: center; padding: 40px 20px; color: #64748b; background-color: #f8fafc; height: 100vh; margin: 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center;'>";
echo "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='currentColor' style='color: #cbd5e1; margin-bottom: 15px;' viewBox='0 0 16 16'><path d='M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.118 10.536a.5.5 0 1 0-.824.568l3 4.5a.5.5 0 0 0 .824-.568l-3-4.5zM11.5 10a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h6a.5.5 0 0 0 .5-.5z'/></svg>";
echo "<h3 style='color: #334155; margin-bottom: 8px; font-weight: 600;'>Documento Indisponível</h3>";
echo "<p style='font-size: 0.95rem; max-width: 300px; line-height: 1.5;'>O profissional ainda não enviou este arquivo ou o upload falhou.</p>";
echo "</div>";
?>