document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-atividades');
    const nomeExibicao = document.getElementById('nome-paciente');

    const nomeSalvo = localStorage.getItem('nome_usuario');
    if (nomeSalvo) {
        nomeExibicao.textContent = nomeSalvo;
    }

    try {
        const response = await fetch('../php/atividades/atividades_get.php');
        const atividades = await response.json();

        container.innerHTML = ''; 

        // AJUSTE CENÁRIO 3: Mensagem exata conforme o critério de aceite
        if (atividades.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Nenhuma atividade encontrada.</p>
                </div>`;
            return;
        }

        atividades.forEach(atv => {
            // AJUSTE CENÁRIO 4: O botão agora é um link <a> que leva para a tela de detalhes
            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm p-3 card-atividade-link">
                        <div class="card-body d-flex flex-column">
                            <div class="mb-2">
                                <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                                    ${atv.categoria}
                                </span>
                            </div>
                            <h5 class="card-title fw-bold text-dark">${atv.titulo}</h5>
                            <p class="text-muted small mt-auto mb-3">
                                <i class="bi bi-calendar-check me-1"></i> Publicado em: ${atv.data_publicacao}
                            </p>
                            
                            <!-- Mudança aqui: de <button> para <a> com o link de detalhes -->
                            <a href="../atividades/detalhes.html?id=${atv.id_atividade}" 
                               class="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm">
                                <i class="bi bi-play-fill me-1"></i> COMEÇAR
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Erro ao carregar atividades do paciente:", error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }
});