document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-atividades');
    const inputBusca = document.getElementById('inputBusca'); 
    
    // Variável para armazenar todas as atividades carregadas do banco
    let todasAtividades = [];

    // Função que desenha os cards na tela
    const renderizarAtividades = (atividades, termoPesquisa = '') => {
        container.innerHTML = '';

        // CENÁRIO 3 — Empty State: exibe mensagens diferentes se for busca vazia ou banco vazio
        if (!Array.isArray(atividades) || atividades.length === 0) {
            if (termoPesquisa) {
                // Se a pessoa pesquisou algo e não achou
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                        <p class="fs-5 text-muted mb-1">Nenhuma atividade encontrada para "<strong>${termoPesquisa}</strong>".</p>
                    </div>`;
            } else {
                // Se o banco realmente estiver vazio
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search fs-1 text-muted"></i>
                        <p class="mt-3 fs-5 text-muted">Nenhuma atividade foi atribuída ao seu dependente ainda.</p>
                        <small class="text-muted">Quando o profissional publicar atividades, elas aparecerão aqui.</small>
                    </div>`;
            }
            return;
        }

        // Desenha os cards normalmente
        atividades.forEach(atv => {
            const dataFormatada = new Date(atv.data_publicacao + 'T00:00:00')
                .toLocaleDateString('pt-BR');

            // ==========================================
            // LÓGICA DE BADGE DE STATUS E BOTÕES ATUALIZADA
            // ==========================================
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

            // CENÁRIO 4 — Redirecionamento de rota (sem modal)
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

    // 1. Carrega os dados do banco via PHP
    try {
        const response = await fetch('../php/atividades/atividades_get.php');
        todasAtividades = await response.json();

        // Renderiza tudo na primeira vez que a página carrega
        renderizarAtividades(todasAtividades);

    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }

    // 2. Evento da barra de pesquisa em tempo real
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();

            // Filtra pelo título OU pela categoria
            const filtradas = todasAtividades.filter(atv => {
                const titulo = (atv.titulo || '').toLowerCase();
                const categoria = (atv.categoria || '').toLowerCase();
                return titulo.includes(termo) || categoria.includes(termo);
            });

            // Manda redesenhar a tela passando a lista filtrada e o termo digitado
            renderizarAtividades(filtradas, termo);
        });
    }
});