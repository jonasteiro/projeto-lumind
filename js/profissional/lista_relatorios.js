document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-relatorios');
    const inputFiltro = document.getElementById('input-filtro');
    let todosRelatorios = [];

    try {
        const res = await fetch('../php/profissional/relatorios_listar.php');
        todosRelatorios = await res.json();
        renderizarCards(todosRelatorios);
    } catch (error) {
        container.innerHTML = `<div class="alert alert-danger w-100">Erro ao carregar.</div>`;
    }

    inputFiltro.addEventListener('input', () => {
        const termo = inputFiltro.value.toLowerCase().trim();
        const filtrados = todosRelatorios.filter(rel =>
            rel.nome_paciente.toLowerCase().includes(termo) ||
            rel.nome_responsavel.toLowerCase().includes(termo)
        );
        renderizarCards(filtrados);
    });

    function renderizarCards(relatorios) {
        container.innerHTML = '';
        if (!relatorios.length) return container.innerHTML = '<p class="text-center">Nenhum relatório.</p>';

        relatorios.forEach(rel => {
            const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const relJSON = JSON.stringify(rel).replace(/"/g, '&quot;');

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm p-3">
                        <div class="card-body">
                            <span class="badge bg-primary mb-2">${rel.nome_paciente}</span>
                            <p class="small text-muted"><i class="bi bi-shield-check"></i> Resp: ${rel.nome_responsavel}</p>
                            <p class="card-text text-truncate">${rel.descricao}</p>
                        </div>
                        <div class="card-footer bg-white border-0">
                            <button class="btn btn-outline-primary w-100" onclick="abrirModal(${relJSON})">
                                <i class="bi bi-eye"></i> Ver Detalhes
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    }

    window.abrirModal = function(rel) {
        document.getElementById('modal-paciente').textContent = rel.nome_paciente;
        document.getElementById('modal-data').textContent = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
        document.getElementById('modal-descricao').textContent = rel.descricao;
        new bootstrap.Modal(document.getElementById('modalRelatorio')).show();
    };
});