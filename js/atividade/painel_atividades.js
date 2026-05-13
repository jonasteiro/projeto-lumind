document.addEventListener('DOMContentLoaded', async () => {
    const listaContainer = document.getElementById('lista-atividades');

    try {
        const response = await fetch('../php/atividades/atividades_get.php');
        const atividades = await response.json();

        listaContainer.innerHTML = ''; // Limpa o "Buscando atividades..."

        // REGRA DE EMPTY STATE (Item 2 do Checklist)
        if (atividades.length === 0) {
            listaContainer.innerHTML = `
                <div class="col-12 text-center p-5">
                    <i class="bi bi-inbox h1 text-muted"></i>
                    <p class="mt-3">Você ainda não postou nenhuma atividade.</p>
                </div>`;
            return;
        }

        // MONTAR LAYOUT COM CARDS (Item 1 do Checklist)
        atividades.forEach(atv => {
            const dataFormatada = new Date(atv.data_publicacao).toLocaleDateString('pt-BR');

            // Aqui usamos a sua classe .card-option para manter o padrão
            const cardHTML = `
                <div class="col-sm-6 col-lg-4">
                    <article class="card-option p-4 text-center">
                        <span class="badge bg-primary mb-2">${atv.categoria}</span>
                        <h4>${atv.titulo}</h4>
                        <p class="text-muted small">Publicado em: ${dataFormatada}</p>
                        
                        <!-- ✅ LINK PARA VISUALIZAÇÃO (Item 3 do Checklist) -->
                        <a href="view_atividade.html?id=${atv.id_atividade}" class="btn btn-sm btn-outline-primary w-100">
                            Ver Detalhes
                        </a>
                    </article>
                </div>`;
            
            listaContainer.innerHTML += cardHTML;
        });

    } catch (error) {
        listaContainer.innerHTML = '<p class="text-danger text-center">Erro ao carregar o painel.</p>';
    }
});