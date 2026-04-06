const tabela = document.getElementById('tabela-pendentes');
const contador = document.getElementById('contador-pendentes');
const alertaGlobal = document.getElementById('alerta-global');
const btnConfirmarReprovar = document.getElementById('btn-confirmar-reprovar');
const inputMotivo = document.getElementById('motivo-texto');
const inputIdReprovar = document.getElementById('reprovar-id-usuario');

const modalReprovarBS = new bootstrap.Modal(document.getElementById('modalReprovar'));
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
                    <div class="small"><strong>Reg:</strong> ${prof.registro_profissional}</div>
                    <div class="small"><strong>Esp:</strong> ${prof.especialidade}</div>
                </td>
                <td>
                    <div class="btn-group">
                        <button onclick="abrirPreview(${prof.id_usuario}, 'cert', 'Diploma de ${prof.nome}')" class="btn btn-outline-primary btn-sm">
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

// NOVA FUNÇÃO: Abre o preview dentro do modal usando iframe
window.abrirPreview = function(id, tipo, titulo) {
    const conteudo = document.getElementById('conteudo-preview');
    document.getElementById('titulo-preview').textContent = titulo;
    
    conteudo.innerHTML = '<div class="p-5"><div class="spinner-border text-success" role="status"></div></div>';
    modalPreviewBS.show();

    // URL do motor de visualização
    const url = `../php/admin/visualizar_documentacao.php?id=${id}&tipo=${tipo}`;

    // Injeta o iframe após um pequeno delay para suavizar a transição
    setTimeout(() => {
        conteudo.innerHTML = `<iframe src="${url}"></iframe>`;
    }, 300);
}

async function enviarDecisao(id, status, motivo = '') {
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
            mostrarAlerta(resultado.mensagem, 'success');
            carregarPendentes();
        } else {
            mostrarAlerta(resultado.mensagem, 'danger');
        }
    } catch (erro) {
        mostrarAlerta("Erro ao processar decisão.", "danger");
    }
}

window.processarDecisao = function(id, status) {
    if (confirm(`Confirmar aprovação deste profissional?`)) {
        enviarDecisao(id, status);
    }
}

window.abrirModalReprovar = function(id) {
    inputIdReprovar.value = id;
    inputMotivo.value = '';
    modalReprovarBS.show();
}

btnConfirmarReprovar.addEventListener('click', () => {
    const id = inputIdReprovar.value;
    const motivo = inputMotivo.value.trim();
    if (motivo.length < 5) {
        alert("O motivo deve ter pelo menos 5 caracteres.");
        return;
    }
    enviarDecisao(id, 'Reprovado', motivo);
    modalReprovarBS.hide();
});

document.addEventListener('DOMContentLoaded', carregarPendentes);