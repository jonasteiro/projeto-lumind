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
            erroMsg.classList.remove("d-none"); // Tira o display:none do Bootstrap
            return; 
        } else {
            erroMsg.classList.add("d-none"); // Devolve o display:none
        }

        // Se passou na validação, preparamos os dados para enviar ao PHP
        // Usamos FormData porque agora temos upload de arquivo (Material de Apoio)
        const formData = new FormData(form);

        try {
            // Procura pelo tipo do botão
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
                // ALERTA PERSONALIZADO DE SUCESSO
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Atividade publicada com sucesso para os pacientes selecionados!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#0d6efd'
                });

                form.reset(); // Limpa o formulário
                document.getElementById('data_publicacao').valueAsDate = new Date(); // Reseta a data
            } else {
                // ALERTA PERSONALIZADO DE ERRO (BACK-END)
                Swal.fire({
                    title: 'Ops!',
                    text: resultado.mensagem,
                    icon: 'error',
                    confirmButtonText: 'Tentar Novamente',
                    confirmButtonColor: '#0d6efd'
                });
            }

        } catch (erro) {
            console.error("Erro na requisição:", erro);
            // ALERTA PERSONALIZADO DE ERRO CRÍTICO (COMUNICAÇÃO)
            Swal.fire({
                title: 'Erro de Comunicação',
                text: 'Não foi possível conectar ao servidor. Verifique o console (F12) para mais detalhes.',
                icon: 'error',
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#dc3545' // Botão vermelho para erro crítico
            });
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
        const resposta = await fetch("../../php/atividades/buscar_pacientes.php");
        const pacientes = await resposta.json();

        container.innerHTML = ""; // Limpa o texto "Carregando..."

        if (pacientes.length === 0) {
            container.innerHTML = "<span class='text-muted'>Nenhum paciente encontrado.</span>";
            return;
        }

        // Cria uma checkbox para cada paciente retornado do banco
        pacientes.forEach(paciente => {
            const label = document.createElement("label");
            label.className = "paciente-item d-block mb-2"; // Adicionado classes do Bootstrap para espaçamento
            
            label.innerHTML = `
                <input type="checkbox" name="pacientes_ids[]" value="${paciente.id_usuario}" class="form-check-input me-2">
                ${paciente.nome}
            `;
            
            container.appendChild(label);
        });

    } catch (erro) {
        console.error("Erro ao buscar pacientes:", erro);
        container.innerHTML = "<span class='text-danger'>Erro ao carregar lista de pacientes.</span>";
    }
}