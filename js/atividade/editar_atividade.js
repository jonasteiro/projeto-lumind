document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idAtividade = params.get('id');
    const form = document.getElementById("formEditarAtividade");

    if (!idAtividade) {
        Swal.fire("Erro", "ID não fornecido.", "error").then(() => history.back());
        return;
    }

    // Configura Preview
    const inputArquivo = document.getElementById('arquivo');
    const previewContainer = document.getElementById('preview-container');
    const previewContent = document.getElementById('preview-content');
    const previewFilename = document.getElementById('preview-filename');
    const btnRemoverAnexo = document.getElementById('btn-remover-anexo');
    const inputManterArquivo = document.getElementById('manter_arquivo');

    function esconderPreview() {
        if (inputArquivo) inputArquivo.value = '';
        if (previewContainer) previewContainer.classList.add('d-none');
        if (previewContent) previewContent.innerHTML = '';
        if (previewFilename) previewFilename.textContent = '';
        inputManterArquivo.value = "false"; // Avisa o PHP para apagar o arquivo antigo do banco
    }

    if (inputArquivo) {
        inputArquivo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                esconderPreview();
                return;
            }

            inputManterArquivo.value = "false"; // Se colocou arquivo novo, não mantém o antigo
            previewFilename.textContent = file.name;
            previewContainer.classList.remove('d-none');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(evento) {
                    previewContent.innerHTML = `<img src="${evento.target.result}" alt="Preview" class="img-fluid rounded border shadow-sm" style="max-height: 250px; object-fit: contain;">`;
                }
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                const fileURL = URL.createObjectURL(file);
                previewContent.innerHTML = `<embed src="${fileURL}#toolbar=0" type="application/pdf" width="100%" height="300px" class="rounded border shadow-sm">`;
            }
        });
    }

    if (btnRemoverAnexo) {
        btnRemoverAnexo.addEventListener('click', esconderPreview);
    }

    // Buscar pacientes e depois buscar dados da atividade
    await carregarPacientes();
    await carregarDadosAtividade();

    async function carregarPacientes() {
        const container = document.getElementById("containerPacientes");
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
                    <input type="checkbox" name="pacientes_ids[]" value="${paciente.id_usuario}" class="form-check-input me-2 cb-paciente">
                    <span class="fw-medium text-dark">${paciente.nome}</span>
                `;
                container.appendChild(label);
            });
        } catch (erro) {
            container.innerHTML = "<span class='text-danger'>Erro ao carregar pacientes.</span>";
        }
    }

    async function carregarDadosAtividade() {
        try {
            const response = await fetch(`../../php/atividades/atividade_submissoes.php?id=${idAtividade}`);
            const result = await response.json();

            if (result.status === 'ok') {
                const atv = result.atividade;
                const submissoes = result.submissoes || [];

                // TRAVA DE SEGURANÇA: Bloqueia a tela se a atividade já foi respondida
                const jaFoiRespondida = submissoes.some(s => s.status_conclusao === 'Concluída' || s.status_conclusao === 'Avaliada');
                
                if (jaFoiRespondida) {
                    Swal.fire({
                        title: 'Ação não permitida!',
                        text: 'Esta atividade já possui respostas dos pacientes e não pode mais ser alterada.',
                        icon: 'warning',
                        confirmButtonColor: '#f59e0b',
                        allowOutsideClick: false
                    }).then(() => {
                        window.location.href = `view_atividade_profissional.html?id=${idAtividade}`;
                    });
                    return; // Interrompe o carregamento da tela
                }

                document.getElementById("id_atividade").value = idAtividade;
                document.getElementById("titulo").value = atv.titulo;
                document.getElementById("descricao").value = atv.descricao;
                document.getElementById("categoria").value = atv.categoria;
                document.getElementById("data_publicacao").value = atv.data_publicacao.split(' ')[0];
                

                // Marca os pacientes que já estavam na atividade
                const checkboxes = document.querySelectorAll('.cb-paciente');
                const submissoes = result.submissoes || [];
                const idsVinculados = submissoes.map(s => s.id_pessoa_tea.toString());
                
                checkboxes.forEach(cb => {
                    if (idsVinculados.includes(cb.value)) {
                        cb.checked = true;
                    }
                });

                // Renderiza anexo antigo no preview se existir
                if (atv.arquivo_anexo && atv.tipo_arquivo) {
                    previewContainer.classList.remove('d-none');
                    previewFilename.textContent = "Arquivo Salvo (Se manter, não precisa enviar de novo)";
                    inputManterArquivo.value = "true";

                    if (atv.tipo_arquivo.startsWith('image/')) {
                        previewContent.innerHTML = `<img src="data:${atv.tipo_arquivo};base64,${atv.arquivo_anexo}" class="img-fluid rounded border shadow-sm" style="max-height: 250px; object-fit: contain;">`;
                    } else {
                        previewContent.innerHTML = `
                            <div class="alert alert-secondary mb-0 w-100 text-center">
                                <i class="bi bi-file-earmark-pdf-fill text-danger fs-1 d-block mb-2"></i>
                                <strong>PDF Salvo</strong>
                            </div>
                        `;
                    }
                }

            } else {
                Swal.fire("Erro", "Não foi possível carregar a atividade.", "error").then(() => history.back());
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Salvar edições
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const selecionados = document.querySelectorAll('input[name="pacientes_ids[]"]:checked');
            if (selecionados.length === 0) {
                document.getElementById("erroPacientes").classList.remove("d-none");
                return;
            }
            
            const btnSalvar = document.getElementById("btnSalvar");
            btnSalvar.disabled = true;
            btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';

            const formData = new FormData(form);

            try {
                const response = await fetch("../../php/atividades/editar_atividade.php", {
                    method: "POST",
                    body: formData
                });

                const json = await response.json();

                if (json.status === "ok") {
                    Swal.fire('Sucesso!', 'Atividade atualizada.', 'success').then(() => {
                        window.location.href = `view_atividade_profissional.html?id=${idAtividade}`;
                    });
                } else {
                    Swal.fire("Ops!", json.mensagem || "Erro ao salvar.", "error");
                }
            } catch (error) {
                Swal.fire("Erro", "Falha de comunicação com o servidor.", "error");
            } finally {
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = '<i class="bi bi-save me-1"></i> Salvar Alterações';
            }
        });
    }
});