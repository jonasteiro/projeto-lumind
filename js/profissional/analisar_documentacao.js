const urlParams = new URLSearchParams(window.location.search);
const idProfissional = urlParams.get('id');

// CORREÇÃO: Função avançada para converter Base64 em Blob e evitar o bloqueio de segurança do navegador
function renderizarArquivo(base64Data, altText) {
    if (!base64Data) {
        return `<div class="p-3 bg-light border rounded text-muted">Nenhum documento enviado.</div>`;
    }
    
    // Identifica se é um PDF pela assinatura inicial do Base64 (JVBER)
    if (base64Data.startsWith('JVBER')) {
        try {
            // CORREÇÃO: Decodifica o Base64 e constrói um Arquivo de Memória (Blob)
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            // CORREÇÃO: Cria uma URL virtual confiável para o navegador ler o PDF
            const blobUrl = URL.createObjectURL(blob);
            
            // CORREÇÃO: Renderiza via iframe usando a URL virtual. O "#toolbar=0" remove a barra preta do topo do PDF.
            return `<iframe src="${blobUrl}#toolbar=0" width="100%" height="280px" class="border rounded shadow-sm" style="border: none;"></iframe>`;
        } catch (erro) {
            console.error("Falha ao converter PDF", erro);
            return `<div class="alert alert-danger p-2"><i class="bi bi-file-earmark-x"></i> Erro interno ao processar o PDF.</div>`;
        }
    } else {
        // CORREÇÃO: Se não for PDF, renderiza como imagem normal. Adicionado style inline preventivo para garantir o tamanho.
        return `<img src="data:image/*;base64,${base64Data}" class="doc-image shadow-sm" style="width: 100%; height: 280px; object-fit: contain;" alt="${altText}" onerror="this.outerHTML='<div class=\\'alert alert-warning p-2\\'><i class=\\'bi bi-exclamation-triangle\\'></i> Erro: Arquivo salvo no banco está corrompido ou é inválido.</div>'">`;
    }
}

async function carregarDocumentos() {
    const divCertificacao = document.getElementById('img-certificacao');
    const divIdentidade = document.getElementById('img-identidade');
    const badgeStatus = document.getElementById('status-badge');

    try {
        const res = await fetch(`../../php/profissional/buscar_documentos.php?id=${idProfissional}`);
        const data = await res.json();
        
        if (data.status === 'ok') {
            const doc = data.documento;
            
            if (divCertificacao) divCertificacao.innerHTML = renderizarArquivo(doc.certificacao, "Certificação Profissional");
            if (divIdentidade) divIdentidade.innerHTML = renderizarArquivo(doc.identidade, "Documento de Identidade");

            if (badgeStatus) {
                badgeStatus.textContent = doc.status_aprovacao || 'Pendente';
                badgeStatus.className = 'badge px-3 py-2 ';
                if (doc.status_aprovacao === 'Aprovado') badgeStatus.classList.add('bg-success');
                else if (doc.status_aprovacao === 'Reprovado') badgeStatus.classList.add('bg-danger');
                else badgeStatus.classList.add('bg-warning', 'text-dark');
            }

        } else {
            if (divCertificacao) divCertificacao.innerHTML = `<p class="text-danger mb-0">${data.mensagem}</p>`;
            if (divIdentidade) divIdentidade.innerHTML = `<p class="text-danger mb-0">${data.mensagem}</p>`;
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        if (divCertificacao) divCertificacao.innerHTML = `<p class="text-danger mb-0">Erro de comunicação com o servidor.</p>`;
        if (divIdentidade) divIdentidade.innerHTML = `<p class="text-danger mb-0">Erro de comunicação com o servidor.</p>`;
    }
}

async function atualizarStatus(status) {
    let motivo = "";
    if (status === 'Reprovado') {
        motivo = prompt("Informe o motivo da reprovação:");
        if (!motivo) return; 
    }

    const formData = new FormData();
    formData.append('id', idProfissional);
    formData.append('status', status);
    formData.append('motivo', motivo);

    try {
        const res = await fetch("../../php/profissional/atualizar_status_doc.php", { 
            method: 'POST', 
            body: formData 
        });
        const data = await res.json();
        
        alert(data.mensagem);
        if (data.status === 'ok') {
            window.location.href = "listar-profissionais.html";
        }
    } catch (e) {
        alert("Erro ao tentar atualizar o status.");
        console.error(e);
    }
}

carregarDocumentos();