document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById('formCadastroPessoaTea');
    const divErro = document.getElementById('divErro');
    
    // =======================================================
    // BLOQUEIO DE DATAS FUTURAS (Trava de Segurança)
    // =======================================================
    const inputData = document.getElementById('data_nascimento');
    if (inputData) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`); // Bloqueia calendário HTML
    }

    // =======================================================
    // FUNÇÕES DE VALIDAÇÃO (Regras)
    // =======================================================
    const ehNomeValido = (val) => val.trim().length >= 3;
    const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const validarCPF = (cpf) => cpf.replace(/\D/g, '').length === 11;
    const ehDataValida = (val) => val.trim() !== "";
    const ehNivelValido = (val) => val.trim() !== "";
    const ehSenhaValida = (val) => val.length >= 6;

    // =======================================================
    // EVENTOS: MOSTRAR E ESCONDER ERROS EM TEMPO REAL
    // =======================================================
    const inputNome = document.getElementById('nome');
    const erroNome = document.getElementById('erroNome');

    const inputEmail = document.getElementById('email');
    const erroEmail = document.getElementById('erroEmail');

    const inputCpf = document.getElementById('cpf');
    const erroCpf = document.getElementById('erroCpf');

    const erroData = document.getElementById('erroData');
    
    const inputNivel = document.getElementById('nivel_tea');
    const erroNivel = document.getElementById('erroNivel');

    const inputSenha = document.getElementById('senha');
    const erroSenha = document.getElementById('erroSenha');

    const inputCpfResp = document.getElementById('cpf_responsavel');
    const erroCpfResp = document.getElementById('erroCpfResponsavel');

    // Função que oculta o erro assim que o usuário digita corretamente
    function ocultarErroSeValido(input, erroElemento, validacaoFn) {
        if(!input || !erroElemento) return;
        const checar = () => {
            if (validacaoFn(input.value)) {
                erroElemento.classList.add('d-none');
            }
        };
        input.addEventListener('input', checar);
        input.addEventListener('change', checar);
        input.addEventListener('keyup', checar);
    }

    // Função que mostra o erro apenas quando o usuário SAI DO CAMPO (blur)
    function mostrarErroSeInvalido(input, erroElemento, validacaoFn, msgInvalido) {
        if(!input || !erroElemento) return;
        input.addEventListener('blur', () => {
            if (!validacaoFn(input.value)) {
                erroElemento.textContent = msgInvalido;
                erroElemento.classList.remove('d-none');
            }
        });
    }

    // Aplicando nos campos
    ocultarErroSeValido(inputNome, erroNome, ehNomeValido);
    mostrarErroSeInvalido(inputNome, erroNome, ehNomeValido, 'O nome deve ter pelo menos 3 caracteres.');

    ocultarErroSeValido(inputEmail, erroEmail, validarEmail);
    mostrarErroSeInvalido(inputEmail, erroEmail, validarEmail, 'Insira um formato de e-mail válido.');

    if(inputCpf) inputCpf.addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
    ocultarErroSeValido(inputCpf, erroCpf, validarCPF);
    mostrarErroSeInvalido(inputCpf, erroCpf, validarCPF, 'O CPF deve ter exatamente 11 números.');

    ocultarErroSeValido(inputData, erroData, ehDataValida);
    mostrarErroSeInvalido(inputData, erroData, ehDataValida, 'A data de nascimento é obrigatória.');

    ocultarErroSeValido(inputNivel, erroNivel, ehNivelValido);
    mostrarErroSeInvalido(inputNivel, erroNivel, ehNivelValido, 'Selecione o nível de suporte do paciente.');

    ocultarErroSeValido(inputSenha, erroSenha, ehSenhaValida);
    mostrarErroSeInvalido(inputSenha, erroSenha, ehSenhaValida, 'A senha deve ter no mínimo 6 caracteres.');

    if(inputCpfResp) inputCpfResp.addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
    ocultarErroSeValido(inputCpfResp, erroCpfResp, validarCPF);
    mostrarErroSeInvalido(inputCpfResp, erroCpfResp, validarCPF, 'O CPF do responsável deve ter 11 números.');


    // =======================================================
    // ENVIO DO FORMULÁRIO (Trava Final e POST)
    // =======================================================
    if (formulario) {
        formulario.addEventListener('submit', async function(e) { 
            e.preventDefault();

            // Dispara o evento de 'blur' em todos os inputs para forçar as mensagens a aparecerem caso o usuário tente enviar em branco
            if(inputNome) inputNome.dispatchEvent(new Event('blur'));
            if(inputEmail) inputEmail.dispatchEvent(new Event('blur'));
            if(inputCpf) inputCpf.dispatchEvent(new Event('blur'));
            if(inputData) inputData.dispatchEvent(new Event('blur'));
            if(inputNivel) inputNivel.dispatchEvent(new Event('blur'));
            if(inputSenha) inputSenha.dispatchEvent(new Event('blur'));
            if(inputCpfResp) inputCpfResp.dispatchEvent(new Event('blur'));

            // Checa se algum Span de erro está aparecendo (não tem a classe d-none)
            const algumErroNaTela = [erroNome, erroEmail, erroCpf, erroData, erroNivel, erroSenha, erroCpfResp]
                                    .some(span => span && !span.classList.contains('d-none'));

            if (algumErroNaTela) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return; // Bloqueia o envio
            }

            // Preparação do envio
            const botao = document.querySelector('button[type="submit"]');
            if(botao) {
                botao.disabled = true;
                botao.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Cadastrando...';
            }

            try {
                const formData = new FormData(); 
                
                formData.append('nome', inputNome.value.trim());
                formData.append('email', inputEmail.value.trim());
                formData.append('cpf', inputCpf.value.replace(/\D/g, ''));
                formData.append('senha', inputSenha.value);
                formData.append('data_nascimento', inputData.value);
                formData.append('tipo_usuario', 'PessoaTea'); 
                formData.append('nivel_tea', inputNivel.value);
                formData.append('cpf_responsavel', inputCpfResp.value.replace(/\D/g, ''));

                const valTelefone = document.getElementById('telefone');
                if(valTelefone && valTelefone.value) {
                    formData.append('telefone', valTelefone.value.replace(/\D/g, ''));
                }

                const valObservacao = document.getElementById('observacao');
                if(valObservacao) {
                    formData.append('observacao', valObservacao.value.trim());
                }

                const resposta = await fetch('../php/usuario_novo.php', {
                    method: 'POST',
                    body: formData
                });

                const dados = await resposta.json();

                if (dados.status === 'sucesso' || dados.status === 'ok') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Paciente (TEA) cadastrado com sucesso!',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        window.location.href = 'lista_pessoa_tea.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Atenção',
                        text: dados.mensagem || 'Erro ao cadastrar paciente.',
                        confirmButtonColor: '#d33'
                    });
                }
            } catch (erro) {
                console.error(erro);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de Conexão',
                    text: 'Falha ao comunicar com o servidor. Tente novamente.',
                    confirmButtonColor: '#d33'
                });
            } finally {
                if(botao) {
                    botao.disabled = false;
                    botao.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Cadastrar Paciente';
                }
            }
        });
    }
});