const selectDependente = document.getElementById('select-dependente');
const inputData = document.getElementById('input-data');
const textareaDescricao = document.getElementById('textarea-descricao');
const btnSalvar = document.getElementById('btn-salvar');
const alertaGlobal = document.getElementById('alerta-global');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const contadorChars = document.getElementById('contador-chars');
const alertaDescricao = document.getElementById('alerta-descricao');

// Inicialização
configurarDataMaxima();
carregarDependentes();

// ------------------------------------------------------------------
// FUNÇÕES DE CONFIGURAÇÃO E API
// ------------------------------------------------------------------

function configurarDataMaxima() {
    const hoje = new Date().toISOString().split('T')[0];
    inputData.setAttribute('max', hoje);
}

async function carregarDependentes() {
    try {
        const res = await fetch('../php/responsavel/dependentes_get.php');
        const dependentes = await res.json();

        if (!Array.isArray(dependentes) || dependentes.length === 0) {
            selectDependente.innerHTML = '<option value="" disabled selected>Nenhum dependente cadastrado</option>';
        } else {
            selectDependente.innerHTML = '<option value="" disabled selected>Selecione o dependente</option>';
            dependentes.forEach(dep => {
                const opt = document.createElement('option');
                opt.value = dep.id_pessoa_tea;
                opt.textContent = dep.nome;
                selectDependente.appendChild(opt);
            });
        }
    } catch (err) {
        selectDependente.innerHTML = '<option value="" disabled selected>Erro ao carregar dependentes</option>';
    }
}

// ------------------------------------------------------------------
// FUNÇÕES DE FEEDBACK PADRONIZADAS
// ------------------------------------------------------------------

function mostrarErro(mensagem) {
    alertaGlobal.textContent = mensagem;
    alertaGlobal.className = 'alert alert-danger d-block mb-4';
    alertaGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarSucesso(mensagem) {
    alertaGlobal.textContent = mensagem;
    alertaGlobal.className = 'alert alert-success d-block mb-4';
    alertaGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    setTimeout(() => {
        window.location.href = 'lista_relatorios_responsavel.html';
    }, 2000);
}

// ------------------------------------------------------------------
// CONTROLE VISUAL DA DESCRIÇÃO (Mantido apenas para UX do contador)
// ------------------------------------------------------------------

function atualizarValidacaoDescricao() {
    const tamanho = textareaDescricao.value.trim().length;
    contadorChars.textContent = `${tamanho}/30 caracteres`;
    
    if (tamanho >= 30) {
        contadorChars.className = 'ms-auto valido';
        alertaDescricao.style.display = 'none';
    } else {
        contadorChars.className = 'ms-auto invalido';
        alertaDescricao.style.display = tamanho > 0 ? 'block' : 'none';
    }
}

textareaDescricao.addEventListener('input', atualizarValidacaoDescricao);

// ------------------------------------------------------------------
// ENVIO DOS DADOS (Atende aos Cenários 1 e 2)
// ------------------------------------------------------------------

btnSalvar.addEventListener('click', async function(e) {
    e.preventDefault(); // Evita recarregar a página

    const dependente = selectDependente.value;
    const data = inputData.value;
    const descricao = textareaDescricao.value.trim();

    // CENÁRIO 2: Recusa a solicitação se houver campos faltando
    if (!dependente || !data || descricao === '') {
        mostrarErro('Todos os campos devem ser preenchidos');
        return; // Interrompe a execução aqui
    }

    // Regra adicional de negócio (garante que não envie com menos de 30 chars mesmo após passar no vazio)
    if (descricao.length < 30) {
        mostrarErro('A descrição deve conter pelo menos 30 caracteres.');
        return;
    }

    // CENÁRIO 1: Feedback de carregamento antes de registrar com sucesso
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    btnSalvar.disabled = true;

    try {
        const formData = new FormData(); 
        formData.append('id_pessoa_tea', dependente);
        formData.append('data_evento', data);
        formData.append('descricao', descricao);

        const resposta = await fetch('../php/responsavel/relatorio_salvar.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        // Sucesso
        if (dados.status === 'ok' || dados.status === 'sucesso') {
            mostrarSucesso('✅ ' + dados.mensagem);
        } else {
            mostrarErro('❌ ' + dados.mensagem);
            btnSalvar.disabled = false; // Libera o botão novamente em caso de erro da API
        }
    } catch (erro) {
        mostrarErro('Erro de conexão com o servidor. Tente novamente.');
        btnSalvar.disabled = false; // Libera o botão em caso de erro de rede
    } finally {
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
});