// Elementos do DOM
const idAtividade = new URLSearchParams(window.location.search).get('id');
const tituloElement = document.getElementById('titulo-atividade');
const descricaoElement = document.getElementById('descricao-atividade');
const categoriaElement = document.getElementById('categoria-atividade');
const dataElement = document.getElementById('data-atividade');
const submissoesElement = document.getElementById('submissoes-list');
const anexoContainer = document.getElementById('container-anexo');
const anexoContent = document.getElementById('anexo-content');
const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
const feedbackText = document.getElementById('feedbackText');
const charCount = document.getElementById('charCount');
const submitFeedbackBtn = document.getElementById('submitFeedback');
const modalPatientName = document.getElementById('modal-patient-name');

let currentFeedbackData = {};

// FIX: Adicionada função rigorosa de sanitização para bloquear injeção de script por comentários do paciente
function sanitizarHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// FIX: Removida a função carregarNomeUsuario() baseada em localStorage. Responsabilidade devolvida ao valida_sessao.js.

// Buscar detalhes da atividade e submissões
async function carregarAtividadeComSubmissoes() {
    if (!idAtividade) {
        alert('ID da atividade não fornecido');
        window.history.back();
        return;
    }

    try {
        const response = await fetch(`../../php/atividades/atividade_submissoes.php?id=${idAtividade}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            alert('Erro ao carregar atividade: ' + (data.mensagem || 'Erro desconhecido'));
            window.history.back();
            return;
        }

        renderizarAtividade(data.atividade);
        renderizarSubmissoes(data.submissoes);

    } catch (error) {
        console.error('Erro ao buscar atividade:', error);
        alert('Erro ao carregar dados da atividade');
    }
}

// Renderizar detalhes da atividade
function renderizarAtividade(atividade) {
    tituloElement.textContent = atividade.titulo || 'Sem título';
    categoriaElement.textContent = atividade.categoria || 'Geral';
    
    // FIX: Aplicada a mesma lógica de formatação de quebra de linhas usada na tela do paciente
    if (atividade.descricao && atividade.descricao.includes('\n')) {
        descricaoElement.innerHTML = atividade.descricao
            .split('\n')
            .filter(l => l.trim())
            .map(l => `<p>${sanitizarHTML(l.trim())}</p>`)
            .join('');
    } else {
        descricaoElement.textContent = atividade.descricao || 'Sem descrição';
    }
    
    //IMPLEMENTAÇÃO NOVO CAMPO
    //++Colocar novo campo abaixo do IF e ELSE (if de cima aqui)
    //document.getElementById('novocampo-atividade').textContent = atividade.novoCampo || 'Não preenchido';
    
    const dataFormatada = atividade.data_publicacao 
        ? new Date(atividade.data_publicacao).toLocaleDateString('pt-BR')
        : 'Data não informada';
    dataElement.textContent = `Publicada em ${dataFormatada}`;

    // Renderizar anexo se existir
    if (atividade.arquivo_anexo) {
        renderizarAnexo(atividade.arquivo_anexo, atividade.tipo_arquivo);
    } else {
        anexoContainer.style.display = 'none';
    }
}

// Renderizar anexo (imagem ou PDF)
function renderizarAnexo(arquivo, tipoArquivo) {
    anexoContainer.style.display = 'block';

    if (tipoArquivo && tipoArquivo.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = `data:${tipoArquivo};base64,${arquivo}`;
        img.className = 'imagem-atividade';
        anexoContent.innerHTML = '';
        anexoContent.appendChild(img);
    } else {
        const btnPdf = document.createElement('a');
        btnPdf.href = `data:application/pdf;base64,${arquivo}`;
        btnPdf.download = 'anexo.pdf';
        btnPdf.className = 'btn-pdf';
        btnPdf.innerHTML = '<i class="bi bi-file-pdf"></i> Baixar Anexo';
        anexoContent.innerHTML = '';
        anexoContent.appendChild(btnPdf);
    }
}

//GET DO CAMPO NOVO DE FEEDBACK
// Renderizar lista de submissões
function renderizarSubmissoes(submissoes) {
    if (!submissoes || submissoes.length === 0) {
        submissoesElement.innerHTML = '<p class="text-center text-muted">Nenhuma submissão ainda</p>';
        return;
    }

    submissoesElement.innerHTML = '';

    submissoes.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'submissao-card';
        card.style.cssText = `
            background: #f8fbfd;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            border-left: 4px solid #0284c7;
        `;

        const statusBadge = (sub.status_conclusao === 'Concluída' || sub.status_conclusao === 'Avaliada')
            ? '<span class="badge-status concluida">✓ Concluída</span>'
            : '<span class="badge-status pendente">⏱ Pendente</span>';

        const dataEntrega = sub.data_conclusao
            ? new Date(sub.data_conclusao).toLocaleDateString('pt-BR')
            : 'Não entregue';

        // FIX: Sanitização direta na injeção do comentário e feedback para segurança.
        const comentarioSanitizado = sanitizarHTML(sub.comentario_paciente);
        const feedbackSanitizado = sanitizarHTML(sub.feedback_profissional);

        //[7-feedback]
        //++COLOCAR ABAIXO DE UMA TAG P O NOVO CAMPO
        //<p style="font-size: 0.9rem; color: #1e293b; margin-bottom: 0.5rem;"><strong>Nota:</strong> ${sanitizarHTML(sub.nota_feedback ?? '--')}</p>
        //++MUDAR O NOME DA VARIAVEL
        const feedbackExistente = sub.feedback_profissional
            ? `
                <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 3px solid #16a34a;">
                    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;"><strong>Seu Feedback:</strong></p>
                    <p style="margin: 0; color: #1e293b;">${feedbackSanitizado}</p>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">
                        Enviado em ${new Date(sub.data_feedback).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            `
            : '';

        // FIX: Incorporação visual garantida da variável de comentário sanitizado.
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h5 style="margin: 0 0 0.25rem 0; color: #1e293b; font-weight: 700;">${sanitizarHTML(sub.nome)}</h5>
                    ${statusBadge}
                </div>
            </div>

            <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">
                <p style="margin: 0.25rem 0;"><strong>Data de entrega:</strong> ${dataEntrega}</p>
                ${sub.comentario_paciente ? `<p style="margin: 0.25rem 0; padding: 0.5rem; background: #fff; border-radius: 4px; border: 1px solid #e2e8f0;"><strong>Comentário do Paciente/Responsável:</strong><br/> ${comentarioSanitizado}</p>` : ''}
            </div>

            ${feedbackExistente}

            <button class="btn btn-sm btn-primary" style="margin-top: ${feedbackExistente ? '1rem' : '0'};" onclick="abrirModalFeedback('${sub.id_pessoa_tea}', '${sub.nome.replace(/'/g, "\\'")}')">
                <i class="bi bi-pencil"></i> ${sub.feedback_profissional ? 'Editar Feedback' : 'Dar Feedback'}
            </button>
        `;

        submissoesElement.appendChild(card);
    });
}

// Abrir modal para dar feedback
function abrirModalFeedback(idPessoaTea, nome) {
    currentFeedbackData = { id_pessoa_tea: idPessoaTea };
    modalPatientName.textContent = nome;
    feedbackText.value = '';
    charCount.textContent = '0/1000';
    feedbackModal.show();
}

// Atualizar contador de caracteres
feedbackText.addEventListener('input', (e) => {
    charCount.textContent = `${e.target.value.length}/1000`;
});

// Enviar feedback
//++COLOCAR AQUI AS ALTERAÇÕES PARA INCLUIR O NOVO CAMPO DO FEEDBACK
submitFeedbackBtn.addEventListener('click', async () => {
    if (!feedbackText.value.trim()) {
        alert('Por favor, escreva um feedback');
        return;
    }

    //[2-feedback]
    //ADICIONAR O CAMPO NOVO DE FEEDBACK
    //const notaFeedback = document.getElementById('nota_feedback').value.trim();

    const formData = new FormData();
    formData.append('id_atividade', idAtividade);
    formData.append('id_pessoa_tea', currentFeedbackData.id_pessoa_tea);
    formData.append('feedback', feedbackText.value);
    //[3-feedback]
    //COLOCAR CAMPO NOVO NO FORMDATA
    //formData.append('nota_feedback', notaFeedback);

    try {
        submitFeedbackBtn.disabled = true;
        submitFeedbackBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

        const response = await fetch('../../php/atividades/salvar_feedback.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'sucesso') {
            alert('Feedback enviado com sucesso!');
            feedbackModal.hide();
            carregarAtividadeComSubmissoes(); 
        } else {
            alert('Erro: ' + data.mensagem);
        }
    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        alert('Erro ao enviar feedback');
    } finally {
        submitFeedbackBtn.disabled = false;
        submitFeedbackBtn.innerHTML = '<i class="bi bi-check-lg"></i> Enviar Feedback';
    }
});

// FIX: Removido o event listener de #logoff redundante daqui. 

// Inicializar página
carregarAtividadeComSubmissoes();