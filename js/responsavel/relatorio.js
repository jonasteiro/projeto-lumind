document.addEventListener('DOMContentLoaded', async () => {

    const selectDependente  = document.getElementById('select-dependente');
    const inputData         = document.getElementById('input-data');
    const textareaDescricao = document.getElementById('textarea-descricao');
    const alertaDescricao   = document.getElementById('alerta-descricao');
    const contadorChars     = document.getElementById('contador-chars');
    const btnSalvar         = document.getElementById('btn-salvar');
    const btnText           = document.getElementById('btn-text');
    const btnSpinner        = document.getElementById('btn-spinner');
    const alertaGlobal      = document.getElementById('alerta-global');

    // CENÁRIO 2: Bloquear datas futuras no input de data
    const hoje = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    inputData.setAttribute('max', hoje);

    // CENÁRIO 1: Carregar drop-down de dependentes da API
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
        console.error('Erro ao carregar dependentes:', err);
        selectDependente.innerHTML = '<option value="" disabled selected>Erro ao carregar dependentes</option>';
    }

    // CENÁRIO 3: Validação em tempo real na textarea (mínimo 30 chars)
    const MIN_CHARS = 30;

    function atualizarValidacaoDescricao() {
        const tamanho = textareaDescricao.value.length;
        const valido  = tamanho >= MIN_CHARS;

        // Contador visual
        contadorChars.textContent = `${tamanho}/${MIN_CHARS} caracteres`;
        contadorChars.className   = valido ? 'ms-auto valido' : 'ms-auto invalido';

        // Alerta em tempo real
        if (!valido && tamanho > 0) {
            alertaDescricao.style.display = 'block';
        } else {
            alertaDescricao.style.display = 'none';
        }

        // Habilita/desabilita botão baseado em TODAS as validações
        atualizarBotao();
    }

    function atualizarBotao() {
        const descricaoValida   = textareaDescricao.value.length >= MIN_CHARS;
        const dataValida        = !!inputData.value;
        const dependenteValido  = !!selectDependente.value;

        btnSalvar.disabled = !(descricaoValida && dataValida && dependenteValido);
    }

    textareaDescricao.addEventListener('input', atualizarValidacaoDescricao);
    inputData.addEventListener('change', atualizarBotao);
    selectDependente.addEventListener('change', atualizarBotao);


    // ENVIO DO FORMULÁRIO
    btnSalvar.addEventListener('click', async () => {
        // Re-validação
        if (textareaDescricao.value.length < MIN_CHARS) {
            mostrarAlerta('warning', 'Descrição muito curta. Escreva pelo menos 30 caracteres.');
            return;
        }

        btnText.classList.add('d-none');
        btnSpinner.classList.remove('d-none');
        btnSalvar.disabled = true;

        const fd = new FormData();
        fd.append('id_pessoa_tea', selectDependente.value);
        fd.append('data_evento',   inputData.value);
        fd.append('descricao',     textareaDescricao.value);

        try {
            const res = await fetch('../php/responsavel/relatorio_salvar.php', {
                method: 'POST',
                body: fd
            });
            const resposta = await res.json();

            if (resposta.status === 'ok') {
                mostrarAlerta('success', '✅ ' + resposta.mensagem);
            // Redireciona para a lista após 1.5s para o usuário ver o feedback
            setTimeout(() => {
                window.location.href = 'lista_relatorios_responsavel.html';
            }, 1500);
            } else {
                mostrarAlerta('danger', '❌ ' + resposta.mensagem);
                btnSalvar.disabled = false;
            }
        } catch (err) {
            console.error('Erro ao enviar relatório:', err);
            mostrarAlerta('danger', 'Erro de conexão. Verifique e tente novamente.');
            btnSalvar.disabled = false;
        } finally {
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
        }
    });

    // Helper: exibir alerta global
    function mostrarAlerta(tipo, mensagem) {
        alertaGlobal.className   = `alert alert-${tipo}`;
        alertaGlobal.textContent = mensagem;
        alertaGlobal.classList.remove('d-none');
        alertaGlobal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});