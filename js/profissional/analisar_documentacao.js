const urlParams = new URLSearchParams(window.location.search);
const idProfissional = urlParams.get('id');

// ==========================================
// RENDERIZAÇÃO DE ARQUIVOS (Amigável)
// ==========================================
function renderizarArquivo(base64Data, altText) {
    if (!base64Data) {
        return `<div class="p-4 bg-light border rounded text-muted text-center">
                    <i class="bi bi-file-earmark-minus fs-1 d-block mb-2 text-secondary"></i>
                    Ainda não há documento enviado para esta categoria.
                </div>`;
    }
    
    if (base64Data.startsWith('JVBER')) {
        try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            
            return `<iframe src="${blobUrl}#toolbar=0" width="100%" height="280px" class="border rounded shadow-sm" style="border: none;"></iframe>`;
        } catch (erro) {
            console.error("Falha ao converter PDF", erro);
            // Mensagem amigável ao invés de erro técnico
            return `<div class="alert alert-warning p-3 text-center">
                        <i class="bi bi-exclamation-circle fs-4 d-block mb-2"></i> 
                        O documento está em um formato não suportado ou corrompido.
                    </div>`;
        }
    } else {
        // Imagem com fallback (onerror) amigável
        return `<img src="data:image/*;base64,${base64Data}" class="doc-image shadow-sm border rounded" style="width: 100%; height: 280px; object-fit: contain;" alt="${altText}" 
                onerror="this.outerHTML='<div class=\\'alert alert-warning p-3 text-center\\'><i class=\\'bi bi-image-alt fs-4 d-block mb-2\\'></i>Não foi possível carregar a imagem deste documento.</div>'">`;
    }
}

// ==========================================
// CARREGAMENTO DOS DOCUMENTOS
// ==========================================
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

            // ========================================================
            // TRAVA DE SEGURANÇA: Bloqueia os botões se já foi avaliado
            // ========================================================
            if (doc.status_aprovacao === 'Aprovado' || doc.status_aprovacao === 'Reprovado') {
                // Procura na tela qualquer botão que chame a função "atualizarStatus"
                const botoesAcao = document.querySelectorAll('button[onclick*="atualizarStatus"]');
                
                botoesAcao.forEach(btn => {
                    btn.disabled = true; // Desativa o clique
                    btn.style.cursor = 'not-allowed'; // Muda o ponteiro do mouse
                    btn.title = 'Esta documentação já foi avaliada.'; // Mensagem ao passar o mouse
                });
            }

        } else {
            // Substitui o erro de banco de dados por um aviso suave de ausência
            const msgAmigavel = `<div class="p-4 bg-light border rounded text-muted text-center"><i class="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>Documentação não localizada.</div>`;
            if (divCertificacao) divCertificacao.innerHTML = msgAmigavel;
            if (divIdentidade) divIdentidade.innerHTML = msgAmigavel;
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        const msgErroConexao = `<div class="alert alert-secondary p-3 text-center"><i class="bi bi-wifi-off fs-4 d-block mb-2"></i>Falha ao se conectar com o servidor. Tente novamente mais tarde.</div>`;
        if (divCertificacao) divCertificacao.innerHTML = msgErroConexao;
        if (divIdentidade) divIdentidade.innerHTML = msgErroConexao;
    }
}

// ==========================================
// APROVAÇÃO E REPROVAÇÃO COM SWEETALERT2
// ==========================================
async function atualizarStatus(status) {
    let motivo = "";

    // Se for Reprovar, chama o SweetAlert com input de texto
    if (status === 'Reprovado') {
        const { value: textoMotivo } = await Swal.fire({
            title: 'Reprovar Documentação',
            text: 'Informe o motivo da reprovação para orientar o profissional:',
            input: 'textarea',
            inputPlaceholder: 'Ex: Documento ilegível, data de validade expirada...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-x-circle"></i> Reprovar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                // Remove os espaços em branco no começo e no fim
                const textoLimpo = value ? value.trim() : '';
                
                if (!textoLimpo) {
                    return 'Você precisa informar um motivo!';
                }
                
                // NOVA REGRA: Mínimo de 15 caracteres
                if (textoLimpo.length < 15) {
                    return `Seja mais específico. Faltam ${15 - textoLimpo.length} caracteres.`;
                }
            }
        });

        if (!textoMotivo) {
            return; // Usuário cancelou a ação
        }
        motivo = textoMotivo;
    } else {
        // Se for aprovar, pede só uma confirmação simples antes de disparar
        const confirmacaoAprovacao = await Swal.fire({
            title: 'Confirmar Aprovação',
            text: "Você verificou a documentação e confirma que ela é válida?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="bi bi-check-circle"></i> Sim, aprovar!',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacaoAprovacao.isConfirmed) {
            return; // Usuário cancelou
        }
    }

    // Prepara os dados para o PHP
    const formData = new FormData();
    formData.append('id', idProfissional);
    formData.append('status', status);
    formData.append('motivo', motivo);

    // Exibe um loading enquanto envia
    Swal.fire({
        title: 'Processando...',
        text: 'Atualizando o status da documentação.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const res = await fetch("../../php/profissional/atualizar_status_doc.php", { 
            method: 'POST', 
            body: formData 
        });
        const data = await res.json();
        
        if (data.status === 'ok') {
            // Fecha o loading e exibe a mensagem de sucesso
            await Swal.fire({
                title: status === 'Aprovado' ? 'Aprovado!' : 'Reprovado!',
                text: status === 'Aprovado' ? 'A documentação foi aprovada com sucesso.' : 'A documentação foi reprovada e o motivo foi registrado.',
                icon: 'success',
                confirmButtonColor: '#0d6efd'
            });
            window.location.href = "listar-profissionais.html";
        } else {
            Swal.fire({
                title: 'Atenção!',
                text: data.mensagem || 'Não foi possível atualizar o status.',
                icon: 'error',
                confirmButtonColor: '#0d6efd'
            });
        }
    } catch (e) {
        console.error(e);
        Swal.fire({
            title: 'Erro de Conexão',
            text: 'Ocorreu um erro ao tentar salvar as alterações. Tente novamente.',
            icon: 'error',
            confirmButtonColor: '#0d6efd'
        });
    }
}

// Inicia o fluxo carregando os arquivos
carregarDocumentos();