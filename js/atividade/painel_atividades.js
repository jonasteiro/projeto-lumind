/**
 * painel_atividades.js
 * Painel do ProfissionalSaude: lista suas atividades com contadores.
 * CORRIGIDO:
 *   - Removido botão "Nova Atividade" que apontava para âncora inexistente
 *   - Link "Ver Submissões" aponta para atividades/view_atividade_profissional.html
 *   - Renderiza cards bonitos com painel_atividades.css
 */

document.addEventListener('DOMContentLoaded', async () => {
    const listaContainer = document.getElementById('lista-atividades');
    const nomeContainer = document.getElementById('nome-profissional');

    // Carregar nome do usuário
    const nome = localStorage.getItem('nome_usuario');
    if (nome && nomeContainer) {
        nomeContainer.textContent = nome;
    }

    // Logoff
    const btnLogoff = document.getElementById('logoff');
    if (btnLogoff) {
        btnLogoff.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('../php/cliente_logoff.php').finally(() => {
                window.location.href = '../login/index.html';
            });
        });
    }

    try {
        const response   = await fetch('../php/atividades/atividades_get.php');
        const atividades = await response.json();

        listaContainer.innerHTML = '';

        if (!Array.isArray(atividades) || atividades.length === 0) {
            listaContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>Você ainda não publicou nenhuma atividade.</p>
                </div>`;
            return;
        }

        atividades.forEach(atv => {
            const dataFormatada = atv.data_publicacao
                ? new Date(atv.data_publicacao + 'T00:00:00').toLocaleDateString('pt-BR')
                : '—';

            const total    = atv.total_atribuidos ?? 0;
            const concluidas = atv.concluidas ?? 0;
            const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

            const cardHTML = `
                <div class="atividade-card">
                    <div class="card-header-activity">
                        <h3>${atv.titulo}</h3>
                        <span class="card-category">${atv.categoria}</span>
                    </div>

                    <div class="card-body-activity">
                        <div class="activity-stat">
                            <i class="bi bi-calendar-event"></i>
                            <span>Publicada em <strong>${dataFormatada}</strong></span>
                        </div>

                        <div class="activity-stat">
                            <i class="bi bi-people"></i>
                            <strong>${total}</strong>
                            <span>paciente${total !== 1 ? 's' : ''} atribuído${total !== 1 ? 's' : ''}</span>
                        </div>

                        <div class="activity-stat">
                            <i class="bi bi-check-circle"></i>
                            <strong>${concluidas}</strong>
                            <span>entrega${concluidas !== 1 ? 's' : ''} concluída${concluidas !== 1 ? 's' : ''}</span>
                        </div>

                        ${total > 0 ? `
                            <div class="activity-progress">
                                <div class="progress-bar-custom">
                                    <div class="progress-fill" style="width: ${percentual}%"></div>
                                </div>
                                <div class="progress-label">${percentual}% de conclusão</div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="card-footer-activity">
                        <div class="btn-group-card">
                            <a href="atividades/view_atividade_profissional.html?id=${atv.id_atividade}"
                               class="btn-card primary">
                                <i class="bi bi-eye"></i> Ver Submissões
                            </a>
                        
                        </div>
                    </div>
                </div>`;

            listaContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error('Erro ao carregar painel:', error);
        listaContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ef4444;">
                <i class="bi bi-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                <p>Erro ao conectar com o servidor.</p>
            </div>`;
    }
});
