document.addEventListener("DOMContentLoaded", () => {
    // Configura a data de hoje como padrão e BLOQUEIA DATAS FUTURAS
    const inputData = document.getElementById('data_publicacao');
    if (inputData) {
        const hoje = new Date();
        inputData.valueAsDate = hoje;

        // Formata a data para YYYY-MM-DD para o atributo max
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        
        // Define o limite máximo no calendário HTML
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`);
    }

    // 1. CARREGAR PACIENTES
    carregarPacientes();

    // =======================================================
    // PREVIEW DE ANEXO (Nova Funcionalidade)
    // =======================================================
    const inputArquivo = document.getElementById('arquivo');
    const previewContainer = document.getElementById('preview-container');
    const previewContent = document.getElementById('preview-content');
    const previewFilename = document.getElementById('preview-filename');
    const btnRemoverAnexo = document.getElementById('btn-remover-anexo');

    function esconderPreview() {
        if (inputArquivo) inputArquivo.value = ''; // Limpa o input
        if (previewContainer) previewContainer.classList.add('d-none');
        if (previewContent) previewContent.innerHTML = '';
        if (previewFilename) previewFilename.textContent = '';
    }

    if (inputArquivo) {
        inputArquivo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            // Se o usuário cancelou a seleção, esconde o preview
            if (!file) {
                esconderPreview();
                return;
            }

            // Mostra o contêiner e o nome do arquivo
            previewFilename.textContent = file.name;
            previewContainer.classList.remove('d-none');

            // Verifica o tipo do arquivo para renderizar
            if (file.type.startsWith('image/')) {
                // Se for imagem, usa o FileReader para mostrar a miniatura
                const reader = new FileReader();
                reader.onload = function(evento) {
                    previewContent.innerHTML = `<img src="${evento.target.result}" alt="Preview do Anexo" class="img-fluid rounded border shadow-sm" style="max-height: 250px; object-fit: contain;">`;
                }
                reader.readAsDataURL(file);
                
            } else if (file.type === 'application/pdf') {
                // Se for PDF, cria uma URL temporária para abrir o documento real na tela
                const fileURL = URL.createObjectURL(file);
                
                // Usamos a tag <embed> para mostrar o visualizador de PDF nativo do navegador
                // O "#toolbar=0" ajuda a esconder a barra de ferramentas do PDF para ficar mais limpo
                previewContent.innerHTML = `
                    <embed src="${fileURL}#toolbar=0" type="application/pdf" width="100%" height="300px" class="rounded border shadow-sm">
                `;
                
            } else {
                // Formato genérico (fallback) caso ele burle o accept do HTML
                previewContent.innerHTML = `<i class="bi bi-file-earmark-fill text-secondary" style="font-size: 5rem;"></i>`;
            }
        });
    }

    if (btnRemoverAnexo) {
        btnRemoverAnexo.addEventListener('click', esconderPreview);
    }

    // =======================================================
    // 2. VALIDAÇÃO EM TEMPO REAL (Estilo Admin)
    // =======================================================
    const form = document.getElementById("formPublicarAtividade");
    
    const inputTitulo = document.getElementById('titulo');
    const erroTitulo = document.getElementById('erroTitulo'); 
    
    const inputDescricao = document.getElementById('descricao');
    const erroDescricao = document.getElementById('erroDescricao'); 

    const inputCategoria = document.getElementById('categoria');
    const erroCategoria = document.getElementById('erroCategoria');

    const erroData = document.getElementById('erroData');
    const erroMsgPacientes = document.getElementById("erroPacientes");

    // Funções Validadoras
    const ehTextoValido = (val, min) => val.trim().length >= min;
    const ehSelectValido = (val) => val.trim() !== "";

    // Remove a mensagem de erro assim que o usuário digita/seleciona o correto
    function ocultarErroSeValido(input, erroElemento, minLength = null) {
        if (!input || !erroElemento) return;
        const checar = () => {
            let valido = minLength ? ehTextoValido(input.value, minLength) : ehSelectValido(input.value);
            if (valido) erroElemento.classList.add('d-none');
        };
        input.addEventListener('input', checar);
        input.addEventListener('change', checar);
        input.addEventListener('keyup', checar);
    }

    // Mostra a mensagem de erro se clicar fora (blur) e estiver errado
    function mostrarErroSeInvalido(input, erroElemento, minLength, msgInvalido) {
        if (!input || !erroElemento) return;
        input.addEventListener('blur', () => {
            let valido = minLength ? ehTextoValido(input.value, minLength) : ehSelectValido(input.value);
            if (!valido) {
                erroElemento.textContent = msgInvalido;
                erroElemento.classList.remove('d-none');
            }
        });
    }

    // Vinculando eventos
    if (inputTitulo) {
        ocultarErroSeValido(inputTitulo, erroTitulo, 5);
        mostrarErroSeInvalido(inputTitulo, erroTitulo, 5, 'O título deve ter pelo menos 5 caracteres.');
    }

    if (inputDescricao) {
        ocultarErroSeValido(inputDescricao, erroDescricao, 10);
        mostrarErroSeInvalido(inputDescricao, erroDescricao, 10, 'A descrição deve ter pelo menos 10 caracteres.');
    }

    if (inputCategoria) {
        ocultarErroSeValido(inputCategoria, erroCategoria);
        mostrarErroSeInvalido(inputCategoria, erroCategoria, null, 'Selecione uma categoria.');
    }

    if (inputData) {
        ocultarErroSeValido(inputData, erroData);
        mostrarErroSeInvalido(inputData, erroData, null, 'Informe a data de publicação.');
    }

    // Tira o erro de pacientes na hora que clica no checkbox
    document.addEventListener('change', (e) => {
        if (e.target.name === 'pacientes_ids[]') {
            const selecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
            if (selecionados.length > 0 && erroMsgPacientes) {
                erroMsgPacientes.classList.add('d-none');
            }
        }
    });

    // =======================================================
    // 3. INTERCEPTAR O ENVIO DO FORMULÁRIO
    // =======================================================
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            let temErro = false;

            // Dispara as validações na marra (Força o 'blur')
            if (inputTitulo) inputTitulo.dispatchEvent(new Event('blur'));
            if (inputDescricao) inputDescricao.dispatchEvent(new Event('blur'));
            if (inputCategoria) inputCategoria.dispatchEvent(new Event('blur'));
            if (inputData) inputData.dispatchEvent(new Event('blur'));

            // Validação de Pacientes
            const pacientesSelecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
            if (pacientesSelecionados.length === 0) {
                if (erroMsgPacientes) {
                    erroMsgPacientes.classList.remove("d-none");
                }
                temErro = true;
            }

            // Verifica se algum span ficou visível
            if ((erroTitulo && !erroTitulo.classList.contains('d-none')) ||
                (erroDescricao && !erroDescricao.classList.contains('d-none')) ||
                (erroCategoria && !erroCategoria.classList.contains('d-none')) ||
                (erroData && !erroData.classList.contains('d-none'))) {
                temErro = true;
            }

            if (temErro) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return; 
            }

            // ==================================
            // ENVIO PARA O SERVIDOR
            // ==================================
            const formData = new FormData(form);
            const btnSubmit = form.querySelector('button[type="submit"]');

            try {
                if (btnSubmit) {
                    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Publicando...';
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
                        confirmButtonText: 'Ver Atividades',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        window.location.href = '../../home/atividades_painel.html';
                    });
                } else {
                    Swal.fire({
                        title: 'Ops!',
                        text: resultado.mensagem,
                        icon: 'error',
                        confirmButtonText: 'Tentar Novamente',
                        confirmButtonColor: '#dc3545'
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
                    btnSubmit.innerHTML = '<i class="bi bi-send-fill me-1"></i> Publicar Atividade';
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
            container.innerHTML = `<span class="text-muted"><i class="bi bi-info-circle me-1"></i>Nenhum paciente encontrado.</span>`;
            return;
        }

        pacientes.forEach(paciente => {
            const label = document.createElement("label");
            label.className = "paciente-item d-block mb-2 p-2 border rounded bg-white shadow-sm";
            label.style.cursor = "pointer";
            label.innerHTML = `
                <input type="checkbox" name="pacientes_ids[]" value="${paciente.id_usuario}" class="form-check-input me-2" style="cursor: pointer;">
                <span class="fw-medium text-dark">${paciente.nome}</span>
            `;
            container.appendChild(label);
        });
    } catch (erro) {
        console.error("Erro ao buscar pacientes:", erro);
        container.innerHTML = "<span class='text-danger'><i class='bi bi-exclamation-triangle me-1'></i> Erro ao carregar lista de pacientes.</span>";
    }
}