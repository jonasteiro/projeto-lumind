/**
 * tela_atividade.js
 * Realiza a atividade — PBI 04 + PBI 05
 * ATUALIZADO: Suporte nativo à Voz, Temas Globais e Correções visuais.
 */

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

        const nomeEl = document.getElementById('nome-usuario');
        if (nomeEl) nomeEl.textContent = usuario.nome;

        const linkBack = document.getElementById('link-back');

        if (tipoUsuarioLogado === 'ResponsavelLegal') {
            if (linkBack) linkBack.href = '../atividades_responsavel.html';
        } else {
            if (linkBack) linkBack.href = '../atividades_paciente.html';
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

    // ── Configura o Botão de Conclusão ────────────────────────────────────
    const btnConcluir = document.getElementById('btn-concluir');
    if (btnConcluir) {
        btnConcluir.addEventListener('click', () => concluirAtividade(idAtividade));
    }

    // ── Configura o Preview de Arquivo do Paciente ────────────────────────
    configurarPreviewResposta();
});


/* =========================================================================
   FUNÇÕES PRINCIPAIS
   ========================================================================= */

// Função auxiliar para ativar a leitura de voz após injetar dados
function ativarVozDinamicamente(elementoHTML, textoParaFalar) {
    if(!elementoHTML) return;
    elementoHTML.setAttribute('data-tts', textoParaFalar);
    
    elementoHTML.addEventListener('mouseenter', () => {
        if (localStorage.getItem('leituraVozLumind') === 'true') {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textoParaFalar);
            utterance.lang = 'pt-BR';
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    });
}

function configurarPreviewResposta() {
    const inputArquivoResposta = document.getElementById('arquivo-resposta');
    const previewContainer = document.getElementById('preview-resposta-container');
    const previewContent = document.getElementById('preview-resposta-content');
    const previewFilename = document.getElementById('preview-resposta-filename');
    const btnRemover = document.getElementById('btn-remover-resposta');

    function esconderPreview() {
        if (inputArquivoResposta) inputArquivoResposta.value = '';
        if (previewContainer) previewContainer.classList.add('d-none');
        if (previewContent) previewContent.innerHTML = '';
        if (previewFilename) previewFilename.textContent = '';
    }

    if (inputArquivoResposta) {
        inputArquivoResposta.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                esconderPreview();
                return;
            }

            previewFilename.textContent = file.name;
            previewContainer.classList.remove('d-none');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(evento) {
                    previewContent.innerHTML = `<img src="${evento.target.result}" alt="Preview" class="img-fluid rounded border shadow-sm" style="max-height: 200px; object-fit: contain;">`;
                }
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                const fileURL = URL.createObjectURL(file);
                previewContent.innerHTML = `<embed src="${fileURL}#toolbar=0" type="application/pdf" width="100%" height="250px" class="rounded border shadow-sm">`;
            } else {
                previewContent.innerHTML = `<i class="bi bi-file-earmark-fill text-secondary" style="font-size: 5rem;"></i>`;
            }
        });
    }

    if (btnRemover) {
        btnRemover.addEventListener('click', esconderPreview);
    }
}

async function carregarAtividade(idAtividade) {
    try {
        const resposta = await fetch(`../../php/atividades/atividade_detalhes.php?id=${idAtividade}`);

        if (!resposta.ok) {
            mostrarErro(`Erro ${resposta.status}: não foi possível carregar.`);
            return;
        }

        const dados = await resposta.json();
        
        if (dados.status === 'nok' || !dados.data) {
            mostrarErro(dados.mensagem || 'Erro ao buscar a atividade.');
            return;
        }

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
    const estadoLoading = document.getElementById('estado-loading');
    const corpoAtividade = document.getElementById('corpo-atividade');
    
    if (estadoLoading) estadoLoading.classList.add('d-none');
    if (corpoAtividade) corpoAtividade.classList.remove('d-none');

    // TÍTULO DA ATIVIDADE + TTS
    const tituloEl = document.getElementById('titulo-atividade');
    const tituloTexto = atv.titulo || 'Atividade sem título';
    tituloEl.textContent = tituloTexto;
    ativarVozDinamicamente(tituloEl, tituloTexto);

    const dataFormatada = atv.data_publicacao
        ? new Date(atv.data_publicacao + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';
    document.getElementById('data-publicacao').innerHTML =
        `<i class="bi bi-calendar-check me-1"></i>Publicado em: ${dataFormatada}`;

    document.getElementById('badge-categoria').textContent = atv.categoria || 'Sem categoria';

    const badgeStatus  = document.getElementById('badge-status');
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

    // DESCRIÇÃO DA ATIVIDADE + TTS
    const descricaoEl = document.getElementById('descricao-atividade');
    const descricaoTexto = atv.descricao || 'Sem descrição.';
    if (descricaoEl) {
        if (atv.descricao && atv.descricao.includes('\n')) {
            descricaoEl.innerHTML = atv.descricao
                .split('\n')
                .filter(l => l.trim())
                .map(l => `<p>${l.trim()}</p>`)
                .join('');
        } else {
            descricaoEl.textContent = descricaoTexto;
        }
        ativarVozDinamicamente(descricaoEl, descricaoTexto);
    }

    // Material de Apoio
    if (atv.arquivo_anexo && atv.tipo_arquivo) {
        document.getElementById('card-anexo').classList.remove('d-none');

        if (atv.tipo_arquivo.startsWith('image/')) {
            document.getElementById('container-imagem').classList.remove('d-none');
            const imgEl = document.getElementById('imagem-anexo');
            imgEl.src = `data:${atv.tipo_arquivo};base64,${atv.arquivo_anexo}`;
            imgEl.alt = `Material de apoio: ${atv.titulo}`;

        } else {
            const containerPdf = document.getElementById('container-pdf');
            containerPdf.classList.remove('d-none');
            
            containerPdf.innerHTML = `
                <embed src="data:application/pdf;base64,${atv.arquivo_anexo}#toolbar=0" type="application/pdf" width="100%" height="400px" class="rounded border shadow-sm mb-3">
                <a href="data:application/pdf;base64,${atv.arquivo_anexo}" download="material-${(atv.titulo || 'apoio').replace(/\s+/g, '-').toLowerCase()}.pdf" class="btn-pdf w-100 btn btn-outline-primary fw-bold py-2">
                    <i class="bi bi-download me-2"></i> Baixar Material de Apoio (Opcional)
                </a>
            `;
        }
    }

    // RESPOSTA DO PACIENTE
    const comentarioEl = document.getElementById('comentario-paciente');
    
    if (estaConcluida) {
        if (atv.comentario_paciente && comentarioEl) {
            comentarioEl.value = atv.comentario_paciente;
        }

        if (atv.arquivo_resposta && atv.tipo_arquivo_resposta) {
            const previewContainer = document.getElementById('preview-resposta-container');
            const previewContent = document.getElementById('preview-resposta-content');
            const previewFilename = document.getElementById('preview-resposta-filename');
            
            previewContainer.classList.remove('d-none');
            previewFilename.textContent = "Arquivo enviado anteriormente";

            if (atv.tipo_arquivo_resposta.startsWith('image/')) {
                previewContent.innerHTML = `<img src="data:${atv.tipo_arquivo_resposta};base64,${atv.arquivo_resposta}" alt="Resposta Anterior" class="img-fluid rounded border shadow-sm" style="max-height: 200px; object-fit: contain;">`;
            } else {
                previewContent.innerHTML = `
                    <div class="alert alert-secondary mb-0 w-100 text-center">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-3 d-block mb-2"></i>
                        <strong>PDF Anexado Anteriormente</strong><br>
                        <a href="data:${atv.tipo_arquivo_resposta};base64,${atv.arquivo_resposta}" download="minha_resposta_anterior.pdf" class="btn btn-sm btn-outline-primary mt-2">
                            <i class="bi bi-download me-1"></i> Baixar para visualizar
                        </a>
                    </div>
                `;
            }
        }

        if (!estaAvaliada) {
            Swal.fire({
                title: 'Atividade já enviada!',
                text: 'Você pode alterar o texto ou anexar um novo arquivo para atualizar a resposta.',
                icon: 'info',
                confirmButtonText: 'Entendi',
                confirmButtonColor: '#0284c7'
            });
        }
    }

    if (estaAvaliada && atv.feedback_profissional) {
        renderizarFeedbackProfissional(atv.feedback_profissional, atv.data_feedback);
    } else if (estaConcluida && !atv.feedback_profissional) {
        renderizarAguardandoAvaliacao();
    }

    ajustarBotaoConclusao(atv.status_conclusao);
}

async function concluirAtividade(idAtividade) {
    const btnConcluir = document.getElementById('btn-concluir');
    const txtAreaComentario = document.getElementById('comentario-paciente');
    const inputArquivo = document.getElementById('arquivo-resposta');
    const previewContainer = document.getElementById('preview-resposta-container');
    
    const comentario = txtAreaComentario ? txtAreaComentario.value.trim() : '';
    const arquivo = (inputArquivo && inputArquivo.files.length > 0) ? inputArquivo.files[0] : null;

    const temArquivoAnterior = !previewContainer.classList.contains('d-none');

    if (!comentario && !arquivo && !temArquivoAnterior) {
        Swal.fire({
            title: 'Atividade Incompleta!',
            text: 'Para enviar, você precisa escrever um comentário ou anexar uma foto/arquivo.',
            icon: 'warning',
            confirmButtonText: 'Entendi',
            confirmButtonColor: '#f59e0b'
        }).then(() => {
            if (txtAreaComentario) txtAreaComentario.focus();
        });
        return; 
    }

    btnConcluir.disabled = true;
    const textoOriginal  = document.getElementById('btn-concluir-texto').textContent;
    document.getElementById('btn-concluir-texto').textContent = 'Enviando...';
    
    try {
        const formData = new FormData();
        formData.append('id_atividade', parseInt(idAtividade));
        
        if (comentario) formData.append('comentario_paciente', comentario);
        if (arquivo) formData.append('arquivo_resposta', arquivo);

        const resposta = await fetch('../../php/atividades/concluir_atividade.php', {
            method: 'POST',
            body: formData 
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 'ok') {
            const badge = document.getElementById('badge-status');
            if (badge) {
                badge.textContent = '✅ Concluída';
                badge.className   = 'badge-status concluida ms-2';
            }
            ajustarBotaoConclusao('Concluída');

            let destinoRedirecionamento = '../atividades_paciente.html';
            if (tipoUsuarioLogado === 'ResponsavelLegal') {
                destinoRedirecionamento = '../atividades_responsavel.html';
            }

            Swal.fire({
                title: 'Sucesso!',
                text: 'Sua resposta foi enviada!',
                icon: 'success',
                confirmButtonText: 'Voltar para Atividades',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = destinoRedirecionamento;
            });

        } else {
            Swal.fire({
                title: 'Erro!',
                text: resultado.mensagem || 'Ocorreu um erro no processamento.',
                icon: 'error',
                confirmButtonText: 'Tentar Novamente'
            });
        }

    } catch (erro) {
        console.error('Erro ao concluir:', erro);
        Swal.fire({
            title: 'Erro de Comunicação',
            text: 'Falha ao comunicar com o servidor. Verifique sua conexão.',
            icon: 'error',
            confirmButtonText: 'Fechar'
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
    const inputArquivo = document.getElementById('arquivo-resposta');
    const btnRemover = document.getElementById('btn-remover-resposta');

    if (statusConclusao === 'Avaliada') {
        btn.disabled = true;
        btn.classList.remove('btn-atualizar');
        btn.style.opacity    = '0.55';
        btn.style.cursor     = 'not-allowed';
        if (texto) texto.textContent = 'Atividade Avaliada';
        if (icone) icone.className = 'bi bi-lock-fill me-2';
        if (comentarioTextarea) comentarioTextarea.disabled = true;
        if (inputArquivo) inputArquivo.disabled = true;
        if (btnRemover) btnRemover.classList.add('d-none');
    } else if (statusConclusao === 'Concluída') {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.add('btn-atualizar');
        if (texto) texto.textContent  = 'Atualizar Minha Resposta';
        if (icone) icone.className = 'bi bi-arrow-repeat me-2';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
        btn.classList.remove('btn-atualizar');
        if (texto) texto.textContent  = 'Enviar Resposta e Concluir';
        if (icone) icone.className = 'bi bi-check-circle-fill me-2';
    }
}

function renderizarAguardandoAvaliacao() {
    if (document.getElementById('card-aguardando-avaliacao')) return;

    const btnConcluir = document.getElementById('btn-concluir');
    const cardResposta = btnConcluir ? btnConcluir.closest('.activity-card') : null;
    const ref = cardResposta || document.getElementById('corpo-atividade');
    if (!ref) return;

    const el = document.createElement('div');
    el.id = 'card-aguardando-avaliacao';
    el.style.cssText = `
        background: var(--theme-hover);
        border: 1px solid var(--theme-border);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    `;
    el.innerHTML = `
        <i class="bi bi-hourglass-split" style="font-size: 2rem; color: var(--theme-primary); flex-shrink: 0;"></i>
        <div>
            <h5 style="margin: 0 0 0.4rem 0; color: var(--theme-primary); font-weight: 700;">Aguardando Avaliação</h5>
            <p style="margin: 0; color: var(--theme-dark); line-height: 1.6; font-size: 0.95rem;">
                Sua resposta foi enviada com sucesso! O profissional responsável irá analisá-la e em breve você receberá o feedback.
            </p>
        </div>
    `;

    ref.insertAdjacentElement('beforebegin', el);
    ativarVozDinamicamente(el, "Aguardando Avaliação. Sua resposta foi enviada com sucesso!");
}

function renderizarFeedbackProfissional(feedback, dataFeedback) {
    if (document.getElementById('card-feedback-prof')) return;

    const btnConcluir = document.getElementById('btn-concluir');
    const cardResposta = btnConcluir ? btnConcluir.closest('.activity-card') : null;
    if (!cardResposta) return;

    const feedbackEl = document.createElement('div');
    feedbackEl.id = 'card-feedback-prof';
    feedbackEl.style.cssText = `
        background: #dcfce7;
        border: 2px solid #86efac;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border-left: 5px solid #16a34a;
    `;

    function sanitizarHTML(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    const feedbackSanitizado = sanitizarHTML(feedback);

    const dataFormatada = dataFeedback
        ? new Date(dataFeedback).toLocaleDateString('pt-BR')
        : 'Data não informada';

    feedbackEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
            <i class="bi bi-chat-left-quote" style="font-size: 1.5rem; color: #16a34a;"></i>
            <h5 style="margin: 0; color: #15803d; font-weight: 700;">Feedback do Profissional</h5>
        </div>
        <p style="margin: 0.75rem 0; color: #1e293b; line-height: 1.6; font-size: 1rem; word-wrap: break-word; overflow-wrap: anywhere;">${feedbackSanitizado}</p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #64748b;">
            <i class="bi bi-calendar-event me-1"></i>Recebido em ${dataFormatada}
        </p>
    `;

    cardResposta.insertAdjacentElement('beforebegin', feedbackEl);
    ativarVozDinamicamente(feedbackEl, `Feedback do Profissional: ${feedbackSanitizado}`);
}