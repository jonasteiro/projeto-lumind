/**
 * atividades_paciente.js
 * Lista de atividades para PessoaTea e ResponsavelLegal.
 * CORRIGIDO:
 * - Nome exibido via validarAcesso (sessão real) e não localStorage
 * - Link "COMEÇAR" aponta para atividades/tela_atividade.html?id=
 * - Busca de status_conclusao exibida no card (Agora suporta o status "Avaliada")
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-atividades');
    const inputBusca = document.getElementById('inputBusca');
    let todasAtividades = [];

    function renderizarAtividades(lista) {
        container.innerHTML = '';

        if (!Array.isArray(lista) || lista.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-clipboard-x fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Nenhuma atividade encontrada.</p>
                </div>`;
            return;
        }

        lista.forEach(atv => {
            
            // ==========================================
            // LÓGICA DE BADGE DE STATUS ATUALIZADA
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

            const dataFormatada = atv.data_publicacao
                ? new Date(atv.data_publicacao + 'T00:00:00').toLocaleDateString('pt-BR')
                : '—';

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
    }

    try {
        const response   = await fetch('../php/atividades/atividades_get.php');
        todasAtividades = await response.json();

        renderizarAtividades(todasAtividades);

        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                const termoDeBusca = e.target.value.toLowerCase().trim();
                const atividadesFiltradas = todasAtividades.filter(atv => 
                    atv.titulo.toLowerCase().includes(termoDeBusca)
                );
                renderizarAtividades(atividadesFiltradas);
            });
        }

    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        container.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Erro ao conectar com o servidor. Verifique sua conexão.
            </div>`;
    }
});