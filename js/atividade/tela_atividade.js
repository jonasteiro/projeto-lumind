/**
 * tela_atividade.js
 * Realiza a atividade — PBI 04 + PBI 05
 * Funciona para PessoaTea e ResponsavelLegal.
 * CORRIGIDO: detecta perfil via sessão e ajusta link de retorno dinamicamente.
 */

document.addEventListener('DOMContentLoaded', async () => {

    // ── Logoff ────────────────────────────────────────────────────────────
    const btnLogoff = document.getElementById('logoff');
    if (btnLogoff) {
        btnLogoff.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('../../php/cliente_logoff.php').finally(() => {
                window.location.href = '../../login/index.html';
            });
        });
    }

    // ── Valida sessão e preenche nome ─────────────────────────────────────
    try {
        const res  = await fetch('../../php/valida_sessao.php');
        const data = await res.json();

        if (data.status === 'nok') {
            window.location.href = '../../login/index.html?erro=sem_sessao';
            return;
        }

        const usuario = data.usuario;
        const tipo    = usuario.tipo_usuario;

        // Preenche nome no topbar
        const nomeEl = document.getElementById('nome-usuario');
        if (nomeEl) nomeEl.textContent = usuario.nome;

        // Ajusta links de retorno conforme perfil
        const linkBack        = document.getElementById('link-back');
        const linkSidebarHome = document.getElementById('sidebar-home');

        if (tipo === 'ResponsavelLegal') {
            if (linkBack)        linkBack.href        = '../atividades_paciente.html';
            if (linkSidebarHome) linkSidebarHome.href = '../tela_responsavel.html';
        } else {
            // PessoaTea (padrão)
            if (linkBack)        linkBack.href        = '../atividades_paciente.html';
            if (linkSidebarHome) linkSidebarHome.href = '../tela_pessoa_tea.html';
        }

        if (!['PessoaTea', 'ResponsavelLegal'].includes(tipo)) {
            alert('ACESSO NEGADO!');
            window.location.href = '../../login/index.html?erro=acesso_negado';
            return;
        }

    } catch (e) {
        console.error('Erro na validação de sessão:', e);
    }

    // ── ID da URL ─────────────────────────────────────────────────────────
    const params      = new URLSearchParams(window.location.search);
    const idAtividade = params.get('id');

    if (!idAtividade || isNaN(idAtividade)) {
        mostrarErro('ID de atividade inválido ou não informado na URL.');
        return;
    }

    // ── Carrega os dados ──────────────────────────────────────────────────
    await carregarAtividade(idAtividade);

    // ── Configura o botão de conclusão ────────────────────────────────────
    const btnConcluir = document.getElementById('btn-concluir');
    if (btnConcluir) {
        btnConcluir.addEventListener('click', () => concluirAtividade(idAtividade));
    }
});


/* =========================================================================
   FUNÇÕES PRINCIPAIS
   ========================================================================= */

async function carregarAtividade(idAtividade) {
    try {
        const resposta = await fetch(`../../php/atividades/atividade_detalhes.php?id=${idAtividade}`);

        if (!resposta.ok) {
            const corpo = await resposta.json().catch(() => ({}));
            mostrarErro(corpo.mensagem || `Erro ${resposta.status}: não foi possível carregar.`);
            return;
        }

        const dados = await resposta.json();
        if (dados.status === 'nok') {
            mostrarErro(dados.mensagem || 'Erro ao buscar a atividade.');
            return;
        }

        renderizarAtividade(dados.data);

    } catch (erro) {
        console.error('Erro ao carregar atividade:', erro);
        mostrarErro('Falha na comunicação com o servidor.');
    }
}

function renderizarAtividade(atv) {
    document.getElementById('estado-loading').classList.add('d-none');
    document.getElementById('corpo-atividade').classList.remove('d-none');

    // Título
    document.getElementById('titulo-atividade').textContent = atv.titulo;

    // Data
    const dataFormatada = atv.data_publicacao
        ? new Date(atv.data_publicacao + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';
    document.getElementById('data-publicacao').innerHTML =
        `<i class="bi bi-calendar-check me-1"></i>Publicado em: ${dataFormatada}`;

    // Categoria
    document.getElementById('badge-categoria').textContent = atv.categoria || 'Sem categoria';

    // Status
    const badgeStatus    = document.getElementById('badge-status');
    const estaAvaliada   = atv.status_conclusao === 'Avaliada';
    const estaConcluida  = atv.status_conclusao === 'Concluída' || estaAvaliada;
    if (estaAvaliada) {
        badgeStatus.textContent = '⭐ Avaliada';
        badgeStatus.className   = 'badge-status avaliada ms-2';
    } else if (estaConcluida) {
        badgeStatus.textContent = '✅ Concluída';
        badgeStatus.className   = 'badge-status concluida ms-2';
    } else {
        badgeStatus.textContent = '⏳ Pendente';
        badgeStatus.className   = 'badge-status pendente ms-2';
    }

    // Descrição
    const descricaoEl = document.getElementById('descricao-atividade');
    if (atv.descricao && atv.descricao.includes('\n')) {
        descricaoEl.innerHTML = atv.descricao
            .split('\n')
            .filter(l => l.trim())
            .map(l => `<p>${l.trim()}</p>`)
            .join('');
    } else {
        descricaoEl.textContent = atv.descricao;
    }

    // Arquivo Anexo
    if (atv.arquivo_anexo && atv.tipo_arquivo) {
        document.getElementById('card-anexo').classList.remove('d-none');

        if (atv.tipo_arquivo.startsWith('image/')) {
            document.getElementById('container-imagem').classList.remove('d-none');
            const imgEl = document.getElementById('imagem-anexo');
            imgEl.src = `data:${atv.tipo_arquivo};base64,${atv.arquivo_anexo}`;
            imgEl.alt = `Material de apoio: ${atv.titulo}`;

        } else if (atv.tipo_arquivo === 'application/pdf') {
            document.getElementById('container-pdf').classList.remove('d-none');
            const linkPdf   = document.getElementById('link-pdf');
            linkPdf.href    = `data:application/pdf;base64,${atv.arquivo_anexo}`;
            linkPdf.download = `material-${atv.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        }
    }

    // Pré-preenche comentário se já concluída ou avaliada
    if (estaConcluida && atv.comentario_paciente) {
        document.getElementById('comentario-paciente').value = atv.comentario_paciente;
    }

    // ── Feedback do profissional ──────────────────────────────────────────
    if (estaAvaliada && atv.feedback_profissional) {
        // Cenário 1: atividade avaliada — exibe o feedback
        renderizarFeedbackProfissional(atv.feedback_profissional, atv.data_feedback);
    } else if (estaConcluida && !atv.feedback_profissional) {
        // Cenário 2 (PBI04): atividade enviada mas ainda sem avaliação — exibe empty state
        renderizarAguardandoAvaliacao();
    }

    ajustarBotaoConclusao(atv.status_conclusao);
}

async function concluirAtividade(idAtividade) {
    const btnConcluir = document.getElementById('btn-concluir');
    const comentario  = document.getElementById('comentario-paciente').value.trim();
    const feedbackDiv = document.getElementById('feedback-msg');

    btnConcluir.disabled = true;
    const textoOriginal  = document.getElementById('btn-concluir-texto').textContent;
    document.getElementById('btn-concluir-texto').textContent = 'Enviando...';
    feedbackDiv.className = 'feedback-msg d-none mt-3';

    try {
        const resposta = await fetch('../../php/atividades/concluir_atividade.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id_atividade:        parseInt(idAtividade),
                comentario_paciente: comentario || null
            })
        });

        const resultado = await resposta.json();

        if (resultado.status === 'ok') {
            mostrarFeedback('✅ Atividade enviada com sucesso!', 'sucesso');
            document.getElementById('badge-status').textContent = '✅ Concluída';
            document.getElementById('badge-status').className   = 'badge-status concluida ms-2';
            ajustarBotaoConclusao('Concluída');
        } else {
            mostrarFeedback('❌ ' + (resultado.mensagem || 'Não foi possível registrar.'), 'erro');
        }

    } catch (erro) {
        console.error('Erro ao concluir:', erro);
        mostrarFeedback('❌ Falha na comunicação com o servidor.', 'erro');
    } finally {
        btnConcluir.disabled = false;
        document.getElementById('btn-concluir-texto').textContent = textoOriginal;
    }
}


/* =========================================================================
   AUXILIARES
   ========================================================================= */

function mostrarErro(mensagem) {
    document.getElementById('estado-loading').classList.add('d-none');
    document.getElementById('mensagem-erro').textContent = mensagem;
    document.getElementById('estado-erro').classList.remove('d-none');
}

function mostrarFeedback(mensagem, tipo) {
    const div   = document.getElementById('feedback-msg');
    div.textContent = mensagem;
    div.className   = `feedback-msg ${tipo} mt-3`;
}

function ajustarBotaoConclusao(statusConclusao) {
    const btn   = document.getElementById('btn-concluir');
    const texto = document.getElementById('btn-concluir-texto');
    const icone = btn.querySelector('i');
    const comentarioTextarea = document.getElementById('comentario-paciente');

    if (statusConclusao === 'Avaliada') {
        // PBI06 fix: atividade já avaliada — bloqueia TUDO, paciente não pode reenviar
        btn.disabled = true;
        btn.classList.remove('btn-atualizar');
        btn.classList.add('btn-bloqueado');
        btn.style.opacity    = '0.55';
        btn.style.cursor     = 'not-allowed';
        texto.textContent    = 'Atividade Avaliada';
        if (icone) icone.className = 'bi bi-lock-fill me-2';
        if (comentarioTextarea) comentarioTextarea.disabled = true;
    } else if (statusConclusao === 'Concluída') {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.add('btn-atualizar');
        texto.textContent  = 'Atualizar Envio';
        if (icone) icone.className = 'bi bi-arrow-repeat me-2';
    } else {
        // Pendente
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.remove('btn-atualizar');
        texto.textContent  = 'Marcar como Concluída';
        if (icone) icone.className = 'bi bi-check-circle-fill me-2';
    }
}

function renderizarAguardandoAvaliacao() {
    // PBI04 Cenário 2: empty state — atividade enviada mas ainda não avaliada
    // Ancora no card pai do btn-concluir (card "Minha Resposta") e insere ANTES dele
    const btnConcluir = document.getElementById('btn-concluir');
    const cardResposta = btnConcluir ? btnConcluir.closest('.activity-card') : null;
    const ref = cardResposta || document.getElementById('corpo-atividade');
    if (!ref) return;

    const el = document.createElement('div');
    el.id = 'card-aguardando-avaliacao';
    el.style.cssText = `
        background: linear-gradient(135deg, #fef9c3 0%, #fefce8 100%);
        border: 2px solid #fde047;
        border-left: 5px solid #ca8a04;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    `;
    el.innerHTML = `
        <i class="bi bi-hourglass-split" style="font-size: 2rem; color: #ca8a04; flex-shrink: 0;"></i>
        <div>
            <h5 style="margin: 0 0 0.4rem 0; color: #92400e; font-weight: 700;">Aguardando Avaliação</h5>
            <p style="margin: 0; color: #78350f; line-height: 1.6; font-size: 0.95rem;">
                Sua atividade foi enviada com sucesso! O profissional responsável irá analisá-la
                e em breve você receberá o feedback aqui nesta tela.
            </p>
        </div>
    `;

    // Insere ANTES do card "Minha Resposta" — funciona com ou sem anexo
    ref.insertAdjacentElement('beforebegin', el);
}

function renderizarFeedbackProfissional(feedback, dataFeedback) {
    const btnConcluir = document.getElementById('btn-concluir');
    const cardResposta = btnConcluir ? btnConcluir.closest('.activity-card') : null;
    if (!cardResposta) return;

    const feedbackEl = document.createElement('div');
    feedbackEl.style.cssText = `
        background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
        border: 2px solid #86efac;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border-left: 5px solid #16a34a;
    `;

    const dataFormatada = dataFeedback
        ? new Date(dataFeedback).toLocaleDateString('pt-BR')
        : 'Data não informada';

    feedbackEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <i class="bi bi-chat-left-quote" style="font-size: 1.5rem; color: #16a34a;"></i>
            <h5 style="margin: 0; color: #15803d; font-weight: 700;">Feedback do Profissional</h5>
        </div>
        <p style="margin: 0.75rem 0; color: #1e293b; line-height: 1.6; font-size: 1rem;">${feedback}</p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #64748b;">
            <i class="bi bi-calendar-event me-1"></i>Recebido em ${dataFormatada}
        </p>
    `;

    cardResposta.insertAdjacentElement('beforebegin', feedbackEl);
}