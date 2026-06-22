document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-relatorios');
    const inputBusca = document.getElementById('inputBusca');
    
    // Variável para armazenar todos os relatórios originais
    let todosRelatorios = [];

    // Função que desenha os cards na tela
    const renderizarRelatorios = (relatorios, termoPesquisa = '') => {
        container.innerHTML = '';

        // Cenário: Nenhum relatório encontrado (banco vazio ou filtro sem resultados)
        if (!Array.isArray(relatorios) || relatorios.length === 0) {
            if (termoPesquisa) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                        <p class="fs-5 text-muted mb-1">Nenhum relatório encontrado para "<strong>${termoPesquisa}</strong>".</p>
                    </div>`;
            } else {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-journal-x fs-1 text-muted"></i>
                        <p class="mt-3 fs-5 text-muted">Você ainda não enviou nenhum relatório.</p>
                        <a href="relatorio_responsavel.html" class="btn btn-primary rounded-pill px-4 mt-2">
                            <i class="bi bi-plus-lg me-1"></i> Criar primeiro relatório
                        </a>
                    </div>`;
            }
            return;
        }

        // Desenha os relatórios na tela
        relatorios.forEach(rel => {
            const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const preview = rel.descricao.length > 120 ? rel.descricao.substring(0, 120) + '...' : rel.descricao;
            
            // Transformamos o objeto em string para passar ao modal
            const relString = JSON.stringify(rel).replace(/"/g, '&quot;');

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm p-3">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                                    <i class="bi bi-person-fill me-1"></i>${rel.nome_dependente}
                                </span>
                                <small class="text-muted"><i class="bi bi-calendar-event me-1"></i>${dataFormatada}</small>
                            </div>
                            <p class="card-text text-muted small flex-grow-1">${preview}</p>
                            
                            <button class="btn btn-outline-primary btn-sm mt-3" onclick="abrirModal(${relString})">
                                <i class="bi bi-eye"></i> Ler Completo
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    };

    // 1. Carrega os dados do banco de dados
    try {
        const res = await fetch('../php/responsavel/relatorios_listar.php');
        todosRelatorios = await res.json();

        // Ordenar do mais recente para o mais antigo
        todosRelatorios.sort((a, b) => new Date(b.data + 'T00:00:00') - new Date(a.data + 'T00:00:00'));

        renderizarRelatorios(todosRelatorios);

    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor.
            </div>`;
    }

    // 2. Adiciona o evento de busca em tempo real
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();

            const filtrados = todosRelatorios.filter(rel => {
                const descricao = (rel.descricao || '').toLowerCase();
                const nomeDependente = (rel.nome_dependente || '').toLowerCase();
                
                // Pesquisa tanto pelo que está escrito no relatório quanto pelo nome do dependente
                return descricao.includes(termo) || nomeDependente.includes(termo);
            });

            renderizarRelatorios(filtrados, termo);
        });
    }
});

// Função global para preencher e abrir o modal
window.abrirModal = function(rel) {
    document.getElementById('modal-data').textContent = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
    document.getElementById('modal-descricao').textContent = rel.descricao;
    
    const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    modal.show();
};