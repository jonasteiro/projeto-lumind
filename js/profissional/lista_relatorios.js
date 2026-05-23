document.addEventListener('DOMContentLoaded', async () => {
    const container   = document.getElementById('lista-relatorios');
    const inputFiltro = document.getElementById('input-filtro');

    // Guarda todos os relatórios para o filtro client-side
    let todosRelatorios = [];

    // BUSCA OS RELATÓRIOS NA API
    try {
        const res = await fetch('../php/profissional/relatorios_listar.php');
        todosRelatorios = await res.json();

        renderizarCards(todosRelatorios);

    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }

    // FILTRO CLIENT-SIDE em tempo real
    inputFiltro.addEventListener('input', () => {
        const termo = inputFiltro.value.toLowerCase().trim();

        if (!termo) {
            renderizarCards(todosRelatorios);
            return;
        }

        const filtrados = todosRelatorios.filter(rel =>
            rel.nome_paciente.toLowerCase().includes(termo) ||
            rel.nome_responsavel.toLowerCase().includes(termo)
        );

        renderizarCards(filtrados);
    });

    // FUNÇÃO DE RENDERIZAÇÃO
    function renderizarCards(relatorios) {
        container.innerHTML = '';

        if (!Array.isArray(relatorios) || relatorios.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-journal-x fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Nenhum relatório encontrado.</p>
                    <small class="text-muted">Os responsáveis ainda não enviaram relatórios para os seus pacientes.</small>
                </div>`;
            return;
        }

        relatorios.forEach(rel => {
            // Evita deslocamento de fuso horário na exibição da data
            const dataFormatada = new Date(rel.data + 'T00:00:00')
                .toLocaleDateString('pt-BR');

            // Preview truncado da descrição
            const preview = rel.descricao.length > 140
                ? rel.descricao.substring(0, 140) + '...'
                : rel.descricao;

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4" 
                     data-paciente="${rel.nome_paciente.toLowerCase()}"
                     data-responsavel="${rel.nome_responsavel.toLowerCase()}">
                    <div class="card h-100 border-0 shadow-sm p-3">
                        <div class="card-body d-flex flex-column">

                            <!-- Cabeçalho do card: paciente + data -->
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle mb-1">
                                        <i class="bi bi-person-fill me-1"></i>${rel.nome_paciente}
                                    </span>
                                    <br>
                                    <small class="text-muted">
                                        <i class="bi bi-shield-check me-1"></i>Resp: ${rel.nome_responsavel}
                                    </small>
                                </div>
                                <small class="text-muted text-nowrap ms-2">
                                    <i class="bi bi-calendar-event me-1"></i>${dataFormatada}
                                </small>
                            </div>

                            <!-- Prévia do conteúdo -->
                            <p class="card-text text-muted small flex-grow-1">${preview}</p>

                        </div>
                    </div>
                </div>`;
        });
    }
});