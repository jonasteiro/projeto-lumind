document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-relatorios');

    try {
        const res = await fetch('../php/responsavel/relatorios_listar.php');
        const relatorios = await res.json();

        container.innerHTML = '';

        // Empty state
        if (!Array.isArray(relatorios) || relatorios.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-journal-x fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Você ainda não enviou nenhum relatório.</p>
                    <a href="relatorio_responsavel.html" class="btn btn-primary rounded-pill px-4 mt-2">
                        <i class="bi bi-plus-lg me-1"></i> Criar primeiro relatório
                    </a>
                </div>`;
            return;
        }

        relatorios.forEach(rel => {
            // Formata a data corretamente sem deslocar por fuso horário
            const dataFormatada = new Date(rel.data + 'T00:00:00')
                .toLocaleDateString('pt-BR');

            // Trunca a descrição para preview no card
            const preview = rel.descricao.length > 120
                ? rel.descricao.substring(0, 120) + '...'
                : rel.descricao;

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm p-3">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                                    <i class="bi bi-person-fill me-1"></i>${rel.nome_dependente}
                                </span>
                                <small class="text-muted">
                                    <i class="bi bi-calendar-event me-1"></i>${dataFormatada}
                                </small>
                            </div>
                            <p class="card-text text-muted small flex-grow-1">${preview}</p>
                        </div>
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }
});