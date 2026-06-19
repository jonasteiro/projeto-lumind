document.addEventListener("DOMContentLoaded", () => {
    // Seleciona o input de pesquisa e os cartões de atividades
    const searchInput = document.querySelector('.search-box input');
    const cards = document.querySelectorAll('.atividade-card');
    const containerLista = document.getElementById('lista-atividades');

    // Cria a mensagem de "Nenhum resultado encontrado" dinamicamente
    const mensagemVazia = document.createElement('div');
    mensagemVazia.className = 'text-center text-muted py-5 w-100 d-none';
    mensagemVazia.style.gridColumn = "1 / -1"; // Para ocupar a largura total do Grid
    mensagemVazia.innerHTML = `
        <i class="bi bi-search fs-1 d-block mb-3 opacity-50"></i>
        <p class="fs-5">Nenhum módulo encontrado para "<strong></strong>".</p>
    `;
    containerLista.appendChild(mensagemVazia);

    // Evento que dispara a cada letra digitada
    searchInput.addEventListener('input', (event) => {
        const termoBusca = event.target.value.toLowerCase().trim();
        let cardsVisiveis = 0;

        cards.forEach(card => {
            // Pega o texto do título e da descrição do card
            const titulo = card.querySelector('.card-header-activity h3').textContent.toLowerCase();
            const descricao = card.querySelector('.card-body-activity p').textContent.toLowerCase();

            // Se o termo digitado existir no título ou na descrição, mostra o card
            if (titulo.includes(termoBusca) || descricao.includes(termoBusca)) {
                card.style.display = 'flex'; // Mantém o display original do CSS
                cardsVisiveis++;
            } else {
                card.style.display = 'none'; // Esconde o card
            }
        });

        // Controle da mensagem de "nenhum resultado"
        if (cardsVisiveis === 0) {
            mensagemVazia.querySelector('strong').textContent = event.target.value;
            mensagemVazia.classList.remove('d-none');
        } else {
            mensagemVazia.classList.add('d-none');
        }
    });
});