document.addEventListener("DOMContentLoaded", () => {
    
    // Configura a data de hoje como padrão no input de data
    document.getElementById('data_publicacao').valueAsDate = new Date();

    // 1. CARREGAR PACIENTES (Referente ao Item 2 do Checklist)
    carregarPacientes();

    // 2. INTERCEPTAR O ENVIO DO FORMULÁRIO (Referente ao Item 3 do Checklist)
    const form = document.getElementById("formPublicarAtividade");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        // Captura todas as checkboxes que foram marcadas
        const pacientesSelecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
        const erroMsg = document.getElementById("erroPacientes");

        // CHECKLIST ITEM 3: Validação do Array length > 0
        if (pacientesSelecionados.length === 0) {
            erroMsg.style.display = "block"; // Mostra o erro em vermelho
            return; // Interrompe a execução aqui, não faz o fetch
        } else {
            erroMsg.style.display = "none"; // Esconde o erro
        }

        // Se passou na validação, preparamos os dados para enviar ao PHP
        // Usamos FormData porque agora temos upload de arquivo (Material de Apoio)
        const formData = new FormData(form);

        try {
            // 👇 AQUI ESTAVA O BUG! Agora ele procura pelo tipo do botão, não pela classe
            const btnSubmit = form.querySelector('button[type="submit"]');
            
            if (btnSubmit) {
                btnSubmit.textContent = "Publicando...";
                btnSubmit.disabled = true;
            }

            // Envia para o Back-end
            const resposta = await fetch("../../php/atividades/criar_atividade.php", {
                method: "POST",
                body: formData
            });

            const resultado = await resposta.json();

            if (resultado.status === "ok") {
                alert("✅ Atividade publicada com sucesso para os pacientes selecionados!");
                form.reset(); // Limpa o formulário
                document.getElementById('data_publicacao').valueAsDate = new Date(); // Reseta a data
            } else {
                alert("❌ Erro: " + resultado.mensagem);
            }

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Erro de comunicação: Abra o console (F12) para ver o detalhe!");
        } finally {
            // Restaura o botão
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = "Publicar Atividade";
                btnSubmit.disabled = false;
            }
        }
    });
});

// Função para buscar os pacientes no banco via API
async function carregarPacientes() {
    const container = document.getElementById("containerPacientes");

    try {
        // Você precisará criar este endpoint simples no PHP para retornar um JSON
        // Ex: [{ "id_usuario": 4, "nome": "Lucas Oliveira" }]
        const resposta = await fetch("../../php/atividades/buscar_pacientes.php");
        const pacientes = await resposta.json();

        container.innerHTML = ""; // Limpa o texto "Carregando..."

        if (pacientes.length === 0) {
            container.innerHTML = "<span>Nenhum paciente encontrado.</span>";
            return;
        }

        // Cria uma checkbox para cada paciente retornado do banco
        pacientes.forEach(paciente => {
            const label = document.createElement("label");
            label.className = "paciente-item";
            
            label.innerHTML = `
                <input type="checkbox" name="pacientes_ids[]" value="${paciente.id_usuario}">
                ${paciente.nome}
            `;
            
            container.appendChild(label);
        });

    } catch (erro) {
        console.error("Erro ao buscar pacientes:", erro);
        container.innerHTML = "<span style='color:red;'>Erro ao carregar lista de pacientes.</span>";
    }
}