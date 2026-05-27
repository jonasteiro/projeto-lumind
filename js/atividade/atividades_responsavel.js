document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-atividades');

    try {
        const response = await fetch('../php/atividades/atividades_get.php');
        const atividades = await response.json();

        container.innerHTML = '';

        // CENÁRIO 3 — Empty State: não renderiza lista vazia, exibe mensagem clara
        if (!Array.isArray(atividades) || atividades.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Nenhuma atividade foi atribuída ao seu dependente ainda.</p>
                    <small class="text-muted">Quando o profissional publicar atividades, elas aparecerão aqui.</small>
                </div>`;
            return;
        }

        atividades.forEach(atv => {
            const dataFormatada = new Date(atv.data_publicacao + 'T00:00:00')
                .toLocaleDateString('pt-BR');

            // Badge de status — mesmo padrão do atividades_paciente.js
            const concluida = atv.status_conclusao === 'Concluída' || atv.status_conclusao === 'Avaliada';
            const statusBadge = concluida
                ? '<span class="badge rounded-pill bg-success">✅ Concluída</span>'
                : '<span class="badge rounded-pill bg-warning text-dark">⏳ Pendente</span>';

            // CENÁRIO 4 — Redirecionamento de rota (sem modal)
            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card-atividade h-100">
                        <div class="card-atividade-topo d-flex justify-content-between align-items-start mb-2">
                            <span class="badge-cat">${atv.categoria}</span>
                            ${statusBadge}
                        </div>
                        <h5 class="card-atividade-titulo">${atv.titulo}</h5>
                        <p class="card-atividade-data">
                            <i class="bi bi-calendar-check me-1"></i>${dataFormatada}
                        </p>
                        <a href="atividades/tela_atividade.html?id=${atv.id_atividade}"
                           class="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm mt-auto">
                            <i class="bi bi-play-fill me-1"></i> COMEÇAR
                        </a>
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }
});