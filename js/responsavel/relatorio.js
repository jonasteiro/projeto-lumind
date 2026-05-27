document.addEventListener("DOMContentLoaded", () => {
    const selectDependente = document.getElementById('select-dependente');
    const inputData = document.getElementById('input-data');
    const textareaDescricao = document.getElementById('textarea-descricao');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const contadorChars = document.getElementById('contador-chars');
    const alertaDescricao = document.getElementById('alerta-descricao');

    // Oculta a div de alerta global antiga por segurança, caso ela tenha ficado no HTML
    const alertaGlobal = document.getElementById('alerta-global');
    if (alertaGlobal) {
        alertaGlobal.style.display = 'none';
        alertaGlobal.classList.add('d-none');
    }

    // Configura data máxima
    if (inputData) {
        const hoje = new Date().toISOString().split('T')[0];
        inputData.setAttribute('max', hoje);
    }

    // Carrega dependentes
    async function carregarDependentes() {
        if (!selectDependente) return;
        try {
            const res = await fetch('../php/responsavel/dependentes_get.php');
            const dependentes = await res.json();

            if (!Array.isArray(dependentes) || dependentes.length === 0) {
                selectDependente.innerHTML = '<option value="" disabled selected>Nenhum dependente cadastrado</option>';
            } else {
                selectDependente.innerHTML = '<option value="" disabled selected>Selecione o dependente</option>';
                dependentes.forEach(dep => {
                    const opt = document.createElement('option');
                    opt.value = dep.id_pessoa_tea || dep.id_usuario; 
                    opt.textContent = dep.nome;
                    selectDependente.appendChild(opt);
                });
            }
        } catch (err) {
            console.error("Erro ao carregar:", err);
        }
    }
    carregarDependentes();

    // Contador de caracteres
    if (textareaDescricao) {
        textareaDescricao.addEventListener('input', function() {
            const tamanho = this.value.trim().length;
            contadorChars.textContent = `${tamanho}/30 caracteres`;
            
            if (tamanho >= 30) {
                contadorChars.className = 'ms-auto valido bg-white border rounded-pill px-3 py-1 shadow-sm';
                alertaDescricao.classList.add('d-none');
            } else {
                contadorChars.className = 'ms-auto invalido bg-white border rounded-pill px-3 py-1 shadow-sm';
                alertaDescricao.classList.remove('d-none');
            }
        });
    }

    // Botão Salvar
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async function(e) {
            e.preventDefault();

            const dependente = selectDependente.value;
            const data = inputData.value;
            const descricao = textareaDescricao.value.trim();

            if (!dependente || !data || descricao === '') {
                Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Todos os campos são obrigatórios!', confirmButtonColor: '#f59e0b' });
                return;
            }
            if (descricao.length < 30) {
                Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Mínimo de 30 caracteres na descrição.', confirmButtonColor: '#f59e0b' });
                return;
            }

            btnText.classList.add('d-none');
            btnSpinner.classList.remove('d-none');
            btnSalvar.disabled = true;

            try {
                const formData = new FormData(); 
                formData.append('id_pessoa_tea', dependente);
                formData.append('data_evento', data);
                formData.append('descricao', descricao);

                const resposta = await fetch('../php/responsavel/relatorio_salvar.php', { method: 'POST', body: formData });
                const dados = await resposta.json();

                if (dados.status === 'ok' || dados.status === 'sucesso') {
                    // SWEET ALERT DE SUCESSO AQUI
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Relatório salvo com sucesso!',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        window.location.href = 'lista_relatorios_responsavel.html';
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Erro', text: dados.mensagem, confirmButtonColor: '#d33' });
                    btnSalvar.disabled = false;
                }
            } catch (erro) {
                Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha na conexão.', confirmButtonColor: '#d33' });
                btnSalvar.disabled = false; 
            } finally {
                btnText.classList.remove('d-none');
                btnSpinner.classList.add('d-none');
            }
        });
    }
});