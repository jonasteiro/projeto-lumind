/**
 * atividades_responsavel.js
 * Lista de atividades para ResponsavelLegal.
 * ATUALIZADO: Inclui Ordenação Inteligente e Filtros Rápidos.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-atividades');
    const inputBusca = document.getElementById('inputBusca');
    const botoesFiltroStatus = document.querySelectorAll('.filtro-status');
    const selectFiltroCategoria = document.getElementById('filtroCategoria');

    let todasAtividades = [];
    
    // Objeto para controlar o estado de todos os filtros simultaneamente
    let estadoFiltros = {
        texto: '',
        status: 'Todos',
        categoria: 'Todas'
    };

    // ====================================================================
    // FUNÇÃO PARA DESENHAR OS CARDS
    // ====================================================================
    const renderizarAtividades = (atividades) => {
        container.innerHTML = '';

        // Validação de Empty State (Estado Vazio)
        if (!Array.isArray(atividades) || atividades.length === 0) {
            let msgPrincipal = "Nenhuma atividade encontrada com estes filtros.";
            let msgSecundaria = "Tente mudar a pesquisa, o status ou a especialidade.";
            let icone = "bi-funnel-fill";

            // Se o banco estiver zerado (sem filtros aplicados)
            if (estadoFiltros.texto === '' && estadoFiltros.status === 'Todos' && estadoFiltros.categoria === 'Todas') {
                msgPrincipal = "Nenhuma atividade foi atribuída ao dependente ainda.";
                msgSecundaria = "Quando o profissional publicar atividades, elas aparecerão aqui.";
                icone = "bi-clipboard-x";
            }

            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi ${icone} fs-1 text-muted opacity-50 mb-3 d-block"></i>
                    <p class="fs-5 text-muted mb-1">${msgPrincipal}</p>
                    <small class="text-muted">${msgSecundaria}</small>
                </div>`;
            return;
        }

        // ORDENAÇÃO INTELIGENTE (Priorizando Pendentes no topo)
        const obterPesoStatus = (status) => {
            if (status === 'Pendente') return 1;
            if (status === 'Concluída') return 2;
            if (status === 'Avaliada') return 3;
            return 4;
        };

        const listaOrdenada = [...atividades].sort((a, b) => {
            const pesoA = obterPesoStatus(a.status_conclusao);
            const pesoB = obterPesoStatus(b.status_conclusao);

            if (pesoA !== pesoB) return pesoA - pesoB;
            
            // Desempate por data
            return new Date(b.data_publicacao + 'T00:00:00') - new Date(a.data_publicacao + 'T00:00:00');
        });

        // DESENHAR CARDS
        listaOrdenada.forEach(atv => {
            const dataFormatada = new Date(atv.data_publicacao + 'T00:00:00').toLocaleDateString('pt-BR');

            let statusBadge = '';
            let btnTexto = '<i class="bi bi-play-fill me-1"></i> COMEÇAR';
            let btnClasse = 'btn-primary';

            if (atv.status_conclusao === 'Avaliada') {
                statusBadge = '<span class="badge rounded-pill bg-info text-dark border border-info shadow-sm" style="background-color: #cff4fc !important;">⭐ Avaliada</span>';
                btnTexto = '<i class="bi bi-eye-fill me-1"></i> VER AVALIAÇÃO';
                btnClasse = 'btn-outline-info text-dark fw-bold border-2';
            } else if (atv.status_conclusao === 'Concluída') {
                statusBadge = '<span class="badge rounded-pill bg-success shadow-sm">✅ Concluída</span>';
                btnTexto = '<i class="bi bi-pencil-square me-1"></i> ALTERAR RESPOSTA';
                btnClasse = 'btn-success';
            } else {
                statusBadge = '<span class="badge rounded-pill bg-warning text-dark shadow-sm">⏳ Pendente</span>';
            }

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card-atividade h-100 position-relative">
                        <div class="card-atividade-topo d-flex justify-content-between align-items-start mb-2">
                            <span class="badge-cat">${atv.categoria}</span>
                            ${statusBadge}
                        </div>
                        <h5 class="card-atividade-titulo">${atv.titulo}</h5>
                        <p class="card-atividade-data">
                            <i class="bi bi-calendar-check me-1"></i>${dataFormatada}
                        </p>
                        <a href="atividades/tela_atividade.html?id=${atv.id_atividade}"
                           class="btn ${btnClasse} w-100 fw-bold rounded-pill py-2 shadow-sm mt-auto">
                            ${btnTexto}
                        </a>
                    </div>
                </div>`;
        });
    };

    // ====================================================================
    // FUNÇÃO MESTRA PARA APLICAR TODOS OS FILTROS JUNTOS
    // ====================================================================
    const aplicarFiltrosGerais = () => {
        const atividadesFiltradas = todasAtividades.filter(atv => {
            // 1. Filtro de Texto (Título ou Categoria)
            const titulo = (atv.titulo || '').toLowerCase();
            const categoriaTexto = (atv.categoria || '').toLowerCase();
            const termo = estadoFiltros.texto;
            const passouTexto = termo === '' || titulo.includes(termo) || categoriaTexto.includes(termo);

            // 2. Filtro de Status (Chips)
            const statusReal = atv.status_conclusao || 'Pendente';
            const passouStatus = estadoFiltros.status === 'Todos' || statusReal === estadoFiltros.status;

            // 3. Filtro de Categoria (Select Dropdown)
            const passouCategoria = estadoFiltros.categoria === 'Todas' || atv.categoria === estadoFiltros.categoria;

            return passouTexto && passouStatus && passouCategoria;
        });

        renderizarAtividades(atividadesFiltradas);
    };

    // ====================================================================
    // VINCULAR EVENTOS DA INTERFACE (LISTENERS)
    // ====================================================================
    
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            estadoFiltros.texto = e.target.value.toLowerCase().trim();
            aplicarFiltrosGerais();
        });
    }

    if (selectFiltroCategoria) {
        selectFiltroCategoria.addEventListener('change', (e) => {
            estadoFiltros.categoria = e.target.value;
            aplicarFiltrosGerais();
        });
    }

    if (botoesFiltroStatus) {
        botoesFiltroStatus.forEach(botao => {
            botao.addEventListener('click', (e) => {
                botoesFiltroStatus.forEach(b => {
                    b.classList.remove('btn-primary', 'active');
                    b.classList.add('btn-outline-secondary');
                });

                const btnClicado = e.currentTarget;
                btnClicado.classList.remove('btn-outline-secondary');
                btnClicado.classList.add('btn-primary', 'active');

                estadoFiltros.status = btnClicado.getAttribute('data-status');
                aplicarFiltrosGerais();
            });
        });
    }

    // ====================================================================
    // CARREGAMENTO INICIAL DO BANCO
    // ====================================================================
    try {
        const response = await fetch('../php/atividades/atividades_get.php');
        todasAtividades = await response.json();
        renderizarAtividades(todasAtividades);
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                <i class="bi bi-wifi-off fs-4 d-block mb-2"></i>
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }
});