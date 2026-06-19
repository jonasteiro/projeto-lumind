/**
 * tela_atividade.js
 * Realiza a atividade — PBI 04 + PBI 05
 * Funciona para PessoaTea e ResponsavelLegal.
 * CORRIGIDO: Fim do loading infinito, alerta com SweetAlert2 e rotas dinâmicas!
 */

// Variável global para armazenar o tipo do usuário e saber pra qual tela voltar
let tipoUsuarioLogado = 'PessoaTea';

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
        tipoUsuarioLogado = usuario.tipo_usuario;

        // Preenche nome no topbar
        const nomeEl = document.getElementById('nome-usuario');
        if (nomeEl) nomeEl.textContent = usuario.nome;

        // Ajusta links de retorno conforme perfil (Agora funciona, pois o ID existe no HTML)
        const linkBack        = document.getElementById('link-back');
        const linkSidebarHome = document.getElementById('sidebar-home');

        if (tipoUsuarioLogado === 'ResponsavelLegal') {
            if (linkBack)        linkBack.href        = '../atividades_responsavel.html';
            if (linkSidebarHome) linkSidebarHome.href = '../tela_responsavel.html';
        } else {
            // PessoaTea (padrão)
            if (linkBack)        linkBack.href        = '../atividades_paciente.html';
            if (linkSidebarHome) linkSidebarHome.href = '../tela_pessoa_tea.html';
        }

        if (!['PessoaTea', 'ResponsavelLegal'].includes(tipoUsuarioLogado)) {
            Swal.fire('ACESSO NEGADO!', 'Você não tem permissão para acessar esta página.', 'error')
                .then(() => window.location.href = '../../login/index.html?erro=acesso_negado');
            return;
        }

    } catch (e) {
        console.error('Erro na validação de sessão:', e);
        mostrarErro('Falha ao validar a sessão. Atualize a página e tente novamente.');
        return; 
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
            mostrarErro(`Erro ${resposta.status}: não foi possível carregar.`);
            return;
        }

        const dados = await resposta.json();
        
        // Trava de segurança: Garante que existem dados
        if (dados.status === 'nok' || !dados.data) {
            mostrarErro(dados.mensagem || 'Erro ao buscar a atividade.');
            return;
        }

        // Trava de segurança contra arrays: se o PHP devolver [ {dados} ], extraímos o {dados}
        const atv = Array.isArray(dados.data) ? dados.data[0] : dados.data;

        if (!atv) {
            mostrarErro('Atividade não encontrada ou vazia no banco de dados.');
            return;
        }

        renderizarAtividade(atv);

    } catch (erro) {
        console.error('Erro ao carregar atividade:', erro);
        mostrarErro('Falha na comunicação com o servidor.');
    }
}

function renderizarAtividade(atv) {
    // Some com o loading e mostra o card
    const estadoLoading = document.getElementById('estado-loading');
    const corpoAtividade = document.getElementById('corpo-atividade');
    
    if (estadoLoading) estadoLoading.classList.add('d-none');
    if (corpoAtividade) corpoAtividade.classList.remove('d-none');

    // Título
    document.getElementById('titulo-atividade').textContent = atv.titulo || 'Atividade sem título';

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
    
    if (badgeStatus) {
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
    }

    // Descrição
    const descricaoEl = document.getElementById('descricao-atividade');
    if (descricaoEl) {
        if (atv.descricao && atv.descricao.includes('\n')) {
            descricaoEl.innerHTML = atv.descricao
                .split('\n')
                .filter(l => l.trim())
                .map(l => `<p>${l.trim()}</p>`)
                .join('');
        } else {
            descricaoEl.textContent = atv.descricao || 'Sem descrição.';
        }
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
            linkPdf.download = `material-${(atv.titulo || 'apoio').replace(/\s+/g, '-').toLowerCase()}.pdf`;
        }
    }

    // Pré-preenche comentário se já concluída ou avaliada
    const comentarioEl = document.getElementById('comentario-paciente');
    if (estaConcluida && atv.comentario_paciente && comentarioEl) {
        comentarioEl.value = atv.comentario_paciente;
    }

    // ── Feedback do profissional ──────────────────────────────────────────
    if (estaAvaliada && atv.feedback_profissional) {
        renderizarFeedbackProfissional(atv.feedback_profissional, atv.data_feedback);
    } else if (estaConcluida && !atv.feedback_profissional) {
        renderizarAguardandoAvaliacao();
    }

    ajustarBotaoConclusao(atv.status_conclusao);
}

async function concluirAtividade(idAtividade) {
    const btnConcluir = document.getElementById('btn-concluir');
    const comentario  = document.getElementById('comentario-paciente') ? document.getElementById('comentario-paciente').value.trim() : '';

    btnConcluir.disabled = true;
    const textoOriginal  = document.getElementById('btn-concluir-texto').textContent;
    document.getElementById('btn-concluir-texto').textContent = 'Enviando...';
    
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

        if (resposta.ok && resultado.status === 'ok') {
            const badge = document.getElementById('badge-status');
            if (badge) {
                badge.textContent = '✅ Concluída';
                badge.className   = 'badge-status concluida ms-2';
            }
            ajustarBotaoConclusao('Concluída');

            // Redirecionamento Dinâmico Inteligente
            let destinoRedirecionamento = '../atividades_paciente.html';
            if (tipoUsuarioLogado === 'ResponsavelLegal') {
                destinoRedirecionamento = '../atividades_responsavel.html';
            }

            Swal.fire({
                title: 'Parabéns!',
                text: 'Sua atividade foi enviada e registrada com sucesso!',
                icon: 'success',
                confirmButtonText: 'Voltar para Atividades',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = destinoRedirecionamento;
            });

        } else {
            Swal.fire({
                title: 'Não foi possível enviar!',
                text: resultado.mensagem || 'Ocorreu um erro no processamento da atividade.',
                icon: 'error',
                confirmButtonText: 'Tentar Novamente',
                confirmButtonColor: '#dc3545'
            });
        }

    } catch (erro) {
        console.error('Erro ao concluir:', erro);
        Swal.fire({
            title: 'Erro de Comunicação',
            text: 'Falha ao comunicar com o servidor. Verifique sua conexão e tente novamente.',
            icon: 'error',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#dc3545'
        });
    } finally {
        if (btnConcluir) {
            btnConcluir.disabled = false;
            document.getElementById('btn-concluir-texto').textContent = textoOriginal;
        }
    }
}


/* =========================================================================
   AUXILIARES
   ========================================================================= */

function mostrarErro(mensagem) {
    const estadoLoading = document.getElementById('estado-loading');
    const estadoErro = document.getElementById('estado-erro');
    const mensagemErro = document.getElementById('mensagem-erro');

    if (estadoLoading) estadoLoading.classList.add('d-none');
    if (mensagemErro) mensagemErro.textContent = mensagem;
    if (estadoErro) estadoErro.classList.remove('d-none');
}

function ajustarBotaoConclusao(statusConclusao) {
    const btn   = document.getElementById('btn-concluir');
    if (!btn) return;

    const texto = document.getElementById('btn-concluir-texto');
    const icone = btn.querySelector('i');
    const comentarioTextarea = document.getElementById('comentario-paciente');

    if (statusConclusao === 'Avaliada') {
        btn.disabled = true;
        btn.classList.remove('btn-atualizar');
        btn.classList.add('btn-bloqueado');
        btn.style.opacity    = '0.55';
        btn.style.cursor     = 'not-allowed';
        if (texto) texto.textContent = 'Atividade Avaliada';
        if (icone) icone.className = 'bi bi-lock-fill me-2';
        if (comentarioTextarea) comentarioTextarea.disabled = true;
    } else if (statusConclusao === 'Concluída') {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.add('btn-atualizar');
        if (texto) texto.textContent  = 'Atualizar Envio';
        if (icone) icone.className = 'bi bi-arrow-repeat me-2';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.remove('btn-atualizar');
        if (texto) texto.textContent  = 'Marcar como Concluída';
        if (icone) icone.className = 'bi bi-check-circle-fill me-2';
    }
}

function renderizarAguardandoAvaliacao() {
    // Se o elemento já existe, não renderiza de novo
    if (document.getElementById('card-aguardando-avaliacao')) return;

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

    ref.insertAdjacentElement('beforebegin', el);
}

function renderizarFeedbackProfissional(feedback, dataFeedback) {
    if (document.getElementById('card-feedback-prof')) return;

    const btnConcluir = document.getElementById('btn-concluir');
    const cardResposta = btnConcluir ? btnConcluir.closest('.activity-card') : null;
    if (!cardResposta) return;

    const feedbackEl = document.createElement('div');
    feedbackEl.id = 'card-feedback-prof';
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