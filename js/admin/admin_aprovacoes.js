const tabela = document.getElementById('tabela-pendentes');
const contador = document.getElementById('contador-pendentes');
const alertaGlobal = document.getElementById('alerta-global');

const modalPreviewBS = new bootstrap.Modal(document.getElementById('modalPreview'));

function mostrarAlerta(mensagem, tipo = 'success') {
    alertaGlobal.textContent = mensagem;
    alertaGlobal.className = `alert alert-${tipo} show`;
    alertaGlobal.classList.remove('d-none');
    setTimeout(() => alertaGlobal.classList.add('d-none'), 5000);
}

async function carregarPendentes() {
    try {
        const resposta = await fetch('../php/admin/listar_pendentes.php');
        const dados = await resposta.json();

        tabela.innerHTML = '';
        contador.textContent = `${dados.length} solicitações pendentes`;

        if (dados.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Nenhuma solicitação pendente.</td></tr>';
            return;
        }

        dados.forEach(prof => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4">
                    <div class="fw-bold">${prof.nome}</div>
                    <div class="small text-muted">${prof.email}</div>
                </td>
                <td>
                    <div class="small"><strong>Reg:</strong> ${prof.registro_profissional || '--'}</div>
                    <div class="small"><strong>Esp:</strong> ${prof.especialidade || 'Geral'}</div>
                </td>
                <td>
                    <div class="btn-group">
                        <button onclick="abrirPreview(${prof.id_usuario}, 'cert', 'Certificação de ${prof.nome}')" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-file-earmark-person"></i> Diploma
                        </button>
                        <button onclick="abrirPreview(${prof.id_usuario}, 'iden', 'Identidade de ${prof.nome}')" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-card-heading"></i> ID
                        </button>
                    </div>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-success btn-sm me-1" onclick="processarDecisao(${prof.id_usuario}, 'Aprovado')">
                        <i class="bi bi-check-lg"></i> Aprovar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="abrirModalReprovar(${prof.id_usuario})">
                        <i class="bi bi-x-lg"></i> Reprovar
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (erro) {
        console.error("Erro:", erro);
        mostrarAlerta("Erro ao carregar solicitações.", "danger");
    }
}

window.abrirPreview = function(id, tipo, titulo) {
    const conteudo = document.getElementById('conteudo-preview');
    document.getElementById('titulo-preview').textContent = titulo;
    
    conteudo.innerHTML = '<div class="p-5 text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Carregando documento...</p></div>';
    modalPreviewBS.show();

    const url = `../php/admin/visualizar_documentacao.php?id=${id}&tipo=${tipo}`;

    setTimeout(() => {
        conteudo.innerHTML = `<iframe src="${url}" width="100%" height="400px" style="border: none;"></iframe>`;
    }, 400);
}

// ==========================================
// APROVAÇÃO / REPROVAÇÃO (SweetAlert2)
// ==========================================
async function enviarDecisao(id, status, motivo = '') {
    // Loading do SweetAlert
    Swal.fire({
        title: 'Processando...',
        text: 'Salvando a avaliação no sistema.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const fd = new FormData();
        fd.append('id_usuario', id);
        fd.append('status', status);
        fd.append('motivo', motivo);

        const resposta = await fetch('../php/admin/status_aprovacao.php', {
            method: 'POST',
            body: fd
        });

        const resultado = await resposta.json();
        
        if (resultado.status === 'sucesso') {
            await Swal.fire({
                title: status === 'Aprovado' ? 'Aprovado!' : 'Reprovado!',
                text: resultado.mensagem || `Profissional ${status.toLowerCase()} com sucesso.`,
                icon: 'success',
                confirmButtonColor: '#0d6efd'
            });
            carregarPendentes(); // Recarrega a tabela para sumir com o profissional aprovado
        } else {
            Swal.fire('Atenção!', resultado.mensagem, 'error');
        }
    } catch (erro) {
        Swal.fire('Erro!', 'Falha de comunicação com o servidor.', 'error');
    }
}

window.processarDecisao = async function(id, status) {
    const confirmacao = await Swal.fire({
        title: 'Confirmar Aprovação',
        text: "Você verificou a documentação e confirma que ela é autêntica?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sim, aprovar!',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        enviarDecisao(id, status);
    }
}

window.abrirModalReprovar = async function(id) {
    const { value: motivo } = await Swal.fire({
        title: 'Reprovar Documentação',
        text: 'Informe o motivo da reprovação para orientar o profissional:',
        input: 'textarea',
        inputPlaceholder: 'Ex: Documento ilegível, fora da validade...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-x-circle"></i> Reprovar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            const textoLimpo = value ? value.trim() : '';
            if (!textoLimpo) {
                return 'Você precisa informar um motivo!';
            }
            if (textoLimpo.length < 5) {
                return `Especifique melhor (mínimo de 5 caracteres).`;
            }
        }
    });

    if (motivo) {
        enviarDecisao(id, 'Reprovado', motivo.trim());
    }
}

document.addEventListener('DOMContentLoaded', carregarPendentes);