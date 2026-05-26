document.addEventListener("DOMContentLoaded", () => {
    // Configura a data de hoje como padrão no input de data
    document.getElementById('data_publicacao').valueAsDate = new Date();

    // 1. CARREGAR PACIENTES
    carregarPacientes();

    // 2. INTERCEPTAR O ENVIO DO FORMULÁRIO
    const form = document.getElementById("formPublicarAtividade");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const pacientesSelecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
        const erroMsg = document.getElementById("erroPacientes");

        if (pacientesSelecionados.length === 0) {
            erroMsg.classList.remove("d-none");
            return; 
        } else {
            erroMsg.classList.add("d-none");
        }

        const formData = new FormData(form);

        try {
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = "Publicando...";
                btnSubmit.disabled = true;
            }

            const resposta = await fetch("../../php/atividades/criar_atividade.php", {
                method: "POST",
                body: formData
            });

            const resultado = await resposta.json();

            if (resultado.status === "ok") {
                // REDIRECIONAMENTO APÓS SUCESSO
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Atividade publicada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#0d6efd'
                }).then(() => {
                    // Aqui está o redirecionamento solicitado
                    window.location.href = '../../home/atividades_painel.html';
                });

            } else {
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
            Swal.fire({
                title: 'Erro de Comunicação',
                text: 'Não foi possível conectar ao servidor.',
                icon: 'error',
                confirmButtonText: 'Fechar',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            const btnSubmit = form.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = "Publicar Atividade";
                btnSubmit.disabled = false;
            }
        }
    });
});

async function carregarPacientes() {
    const container = document.getElementById("containerPacientes");
    try {
        const resposta = await fetch("../../php/atividades/buscar_pacientes.php");
        const pacientes = await resposta.json();

        container.innerHTML = ""; 
        if (pacientes.length === 0) {
            container.innerHTML = "<span class='text-muted'>Nenhum paciente encontrado.</span>";
            return;
        }

        pacientes.forEach(paciente => {
            const label = document.createElement("label");
            label.className = "paciente-item d-block mb-2";
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