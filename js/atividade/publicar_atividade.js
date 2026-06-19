document.addEventListener("DOMContentLoaded", () => {
    // Configura a data de hoje como padrão no input de data
    const inputData = document.getElementById('data_publicacao');
    if (inputData) inputData.valueAsDate = new Date();

    // 1. CARREGAR PACIENTES
    carregarPacientes();

    // =======================================================
    // 2. VALIDAÇÃO EM TEMPO REAL (Estilo Admin)
    // =======================================================
    const form = document.getElementById("formPublicarAtividade");
    
    // Pegando os inputs e os spans de erro (Certifique-se de ter esses IDs no HTML)
    const inputTitulo = document.getElementById('titulo');
    const erroTitulo = document.getElementById('erroTitulo'); 
    
    const inputDescricao = document.getElementById('descricao');
    const erroDescricao = document.getElementById('erroDescricao'); 
    
    const erroMsgPacientes = document.getElementById("erroPacientes");

    // Função validadora genérica
    const ehTextoValido = (val, min) => val.trim().length >= min;

    // Remove a mensagem de erro assim que o usuário digita o correto
    function ocultarErroSeValido(input, erroElemento, minLength) {
        if (!input || !erroElemento) return;
        const checar = () => {
            if (ehTextoValido(input.value, minLength)) {
                erroElemento.classList.add('d-none');
            }
        };
        input.addEventListener('input', checar);
        input.addEventListener('keyup', checar);
    }

    // Mostra a mensagem de erro se o usuário clicar fora do campo (blur) e estiver vazio/curto
    function mostrarErroSeInvalido(input, erroElemento, minLength, msgInvalido) {
        if (!input || !erroElemento) return;
        input.addEventListener('blur', () => {
            if (!ehTextoValido(input.value, minLength)) {
                erroElemento.textContent = msgInvalido;
                erroElemento.classList.remove('d-none');
            }
        });
    }

    // Aplicando a lógica de tempo real nos campos (Mínimo de 5 chars pro título e 10 pra descrição)
    if (inputTitulo) {
        ocultarErroSeValido(inputTitulo, erroTitulo, 5);
        mostrarErroSeInvalido(inputTitulo, erroTitulo, 5, 'O título deve ter pelo menos 5 caracteres.');
    }

    if (inputDescricao) {
        ocultarErroSeValido(inputDescricao, erroDescricao, 10);
        mostrarErroSeInvalido(inputDescricao, erroDescricao, 10, 'A descrição deve ter pelo menos 10 caracteres.');
    }

    // Ocultar erro de pacientes se o usuário clicar em algum checkbox
    document.addEventListener('change', (e) => {
        if (e.target.name === 'pacientes_ids[]') {
            const selecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
            if (selecionados.length > 0 && erroMsgPacientes) {
                erroMsgPacientes.classList.add('d-none');
            }
        }
    });

    // =======================================================
    // 3. INTERCEPTAR O ENVIO DO FORMULÁRIO (Validação Final)
    // =======================================================
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            let temErro = false;

            // Força a checagem do Título
            if (inputTitulo && !ehTextoValido(inputTitulo.value, 5)) {
                erroTitulo.textContent = 'O título deve ter pelo menos 5 caracteres.';
                erroTitulo.classList.remove('d-none');
                temErro = true;
            }

            // Força a checagem da Descrição
            if (inputDescricao && !ehTextoValido(inputDescricao.value, 10)) {
                erroDescricao.textContent = 'A descrição deve ter pelo menos 10 caracteres.';
                erroDescricao.classList.remove('d-none');
                temErro = true;
            }

            // Validação de Pacientes (Garante que pelo menos 1 foi escolhido)
            const pacientesSelecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
            if (pacientesSelecionados.length === 0) {
                if (erroMsgPacientes) {
                    erroMsgPacientes.textContent = 'Você deve selecionar pelo menos um paciente.';
                    erroMsgPacientes.classList.remove("d-none");
                }
                temErro = true;
            }

            // Se encontrou erros, bloqueia o envio e sobe a tela suavemente
            if (temErro) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return; 
            }

            // ==================================
            // ENVIO PARA O SERVIDOR (PHP)
            // ==================================
            const formData = new FormData(form);
            const btnSubmit = form.querySelector('button[type="submit"]');

            try {
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
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Atividade publicada com sucesso!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#0d6efd'
                    }).then(() => {
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
                if (btnSubmit) {
                    btnSubmit.textContent = "Publicar Atividade";
                    btnSubmit.disabled = false;
                }
            }
        });
    }
});

// =======================================================
// 4. BUSCAR PACIENTES NO BANCO
// =======================================================
async function carregarPacientes() {
    const container = document.getElementById("containerPacientes");
    if (!container) return;

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