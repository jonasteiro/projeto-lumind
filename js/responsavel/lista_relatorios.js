document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('lista-relatorios');
    const inputBusca = document.getElementById('inputBusca');
    
    let todosRelatorios = [];
    let relatorioEditandoId = null; 

    const renderizarRelatorios = (relatorios, termoPesquisa = '') => {
        container.innerHTML = '';

        if (!Array.isArray(relatorios) || relatorios.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-journal-x fs-1 text-muted"></i>
                    <p class="mt-3 fs-5 text-muted">Nenhum relatório encontrado.</p>
                </div>`;
            return;
        }

        relatorios.forEach(rel => {
            const dataFormatada = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const preview = rel.descricao.length > 120 ? rel.descricao.substring(0, 120) + '...' : rel.descricao;
            
            const relString = JSON.stringify(rel).replace(/'/g, "&apos;").replace(/"/g, '&quot;');

            container.innerHTML += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm p-3">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                                    <i class="bi bi-person-fill me-1"></i>${rel.nome_dependente || 'Dependente'}
                                </span>
                                <small class="text-muted"><i class="bi bi-calendar-event me-1"></i>${dataFormatada}</small>
                            </div>
                            <p class="card-text text-muted small flex-grow-1">${preview}</p>
                            
                            <button class="btn btn-outline-primary btn-sm mt-3 fw-bold" onclick="abrirModal('${relString}')">
                                <i class="bi bi-eye me-1"></i> Ler / Editar
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    };

    const carregarRelatorios = async () => {
        try {
            const res = await fetch('../php/responsavel/relatorios_listar.php');
            todosRelatorios = await res.json();
            todosRelatorios.sort((a, b) => new Date(b.data + 'T00:00:00') - new Date(a.data + 'T00:00:00'));
            renderizarRelatorios(todosRelatorios);
        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger w-100 text-center">Erro de conexão com o banco.</div>`;
        }
    };

    carregarRelatorios();

    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const filtrados = todosRelatorios.filter(rel => 
                (rel.descricao || '').toLowerCase().includes(termo) || 
                (rel.nome_dependente || '').toLowerCase().includes(termo)
            );
            renderizarRelatorios(filtrados, termo);
        });
    }

    // ==============================================================
    // A MÁGICA DA EDIÇÃO NA MESMA TELA
    // ==============================================================
    const divDescricao = document.getElementById('modal-descricao');
    const txtAreaEdit = document.getElementById('modal-descricao-edit');
    const btnIniciarEdicao = document.getElementById('btn-iniciar-edicao');
    const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');

    // 1. Abre o modal no modo Leitura Padrão
    window.abrirModal = function(relString) {
        const rel = JSON.parse(relString);
        relatorioEditandoId = rel.id_relatorio || rel.id;

        document.getElementById('modal-data').textContent = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
        divDescricao.textContent = rel.descricao;
        txtAreaEdit.value = rel.descricao; // Preenche a caixa de edição com o texto original

        // Reseta as telas (Garante que vai abrir em modo visualização)
        divDescricao.classList.remove('d-none');
        txtAreaEdit.classList.add('d-none');
        btnIniciarEdicao.classList.remove('d-none');
        btnSalvarEdicao.classList.add('d-none');

        const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
        modal.show();
    };

    // 2. Botão "Editar" (Esconde texto fixo, mostra caixa de texto)
    btnIniciarEdicao.addEventListener('click', () => {
        divDescricao.classList.add('d-none');
        txtAreaEdit.classList.remove('d-none');
        
        btnIniciarEdicao.classList.add('d-none');
        btnSalvarEdicao.classList.remove('d-none');

        txtAreaEdit.focus(); // Coloca o cursor piscando lá dentro
    });

    // 3. Botão "Salvar Alterações" (Envia pro PHP)
    btnSalvarEdicao.addEventListener('click', async () => {
        // Captura o valor EXATO que está no textarea no momento do clique
        const inputEdicaoAtual = document.getElementById('modal-descricao-edit');
        const novaDescricao = inputEdicaoAtual.value.trim();

        // VALIDAÇÕES MAIS CLARAS
        if (novaDescricao === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Você apagou todo o texto! O relatório não pode ficar vazio.',
                confirmButtonColor: '#0284c7'
            });
            return;
        }

        if (novaDescricao.length < 30) {
            Swal.fire({
                icon: 'warning',
                title: 'Texto muito curto',
                text: 'O relatório precisa ter pelo menos 30 caracteres. (Atual: ' + novaDescricao.length + ')',
                confirmButtonColor: '#0284c7'
            });
            return;
        }

        // Efeito de carregamento no botão
        const textoBotaoOriginal = btnSalvarEdicao.innerHTML;
        btnSalvarEdicao.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';
        btnSalvarEdicao.disabled = true;

        try {
            const formData = new FormData();
            formData.append('id_relatorio', relatorioEditandoId);
            formData.append('descricao', novaDescricao);

            // Chama o PHP que criamos na resposta anterior
            const res = await fetch('../php/responsavel/relatorioS_atualizar.php', {
                method: 'POST',
                body: formData
            });

            const retorno = await res.json();

            if (retorno.status === 'ok' || retorno.status === 'sucesso') {
                Swal.fire({
                    icon: 'success',
                    title: 'Atualizado!',
                    text: 'O relatório foi salvo com sucesso.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Atualiza a tela visual sem precisar recarregar a página!
                divDescricao.textContent = novaDescricao;
                divDescricao.classList.remove('d-none');
                txtAreaEdit.classList.add('d-none');
                btnIniciarEdicao.classList.remove('d-none');
                btnSalvarEdicao.classList.add('d-none');

                // Recarrega os cards ali atrás discretamente
                carregarRelatorios();
            } else {
                Swal.fire('Erro', retorno.mensagem, 'error');
            }
        } catch (error) {
            Swal.fire('Erro', 'Falha ao conectar com o banco de dados. Verifique a internet.', 'error');
        } finally {
            // Devolve o botão ao normal se der erro
            btnSalvarEdicao.innerHTML = textoBotaoOriginal;
            btnSalvarEdicao.disabled = false;
        }
    });
});