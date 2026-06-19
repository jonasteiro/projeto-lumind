document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCadastroResponsavel");
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
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`); 
    }

    // =======================================================
    // FUNÇÕES DE VALIDAÇÃO (Regras)
    // =======================================================
    const ehNomeValido = (val) => val.trim().length >= 3;
    const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const validarCPF = (cpf) => cpf.replace(/\D/g, '').length === 11;
    const validarTelefone = (tel) => tel.replace(/\D/g, '').length >= 10;
    const ehDataValida = (val) => val.trim() !== "";
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

    const inputTelefone = document.getElementById('telefone');
    const erroTelefone = document.getElementById('erroTelefone');

    const erroData = document.getElementById('erroData');

    const inputSenha = document.getElementById('senha');
    const erroSenha = document.getElementById('erroSenha');

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

    if(inputCpf) inputCpf.addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').slice(0, 11); });
    ocultarErroSeValido(inputCpf, erroCpf, validarCPF);
    mostrarErroSeInvalido(inputCpf, erroCpf, validarCPF, 'O CPF deve ter exatamente 11 números.');

    if(inputTelefone) inputTelefone.addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').slice(0, 15); });
    ocultarErroSeValido(inputTelefone, erroTelefone, validarTelefone);
    mostrarErroSeInvalido(inputTelefone, erroTelefone, validarTelefone, 'Telefone inválido (inclua DDD).');

    ocultarErroSeValido(inputData, erroData, ehDataValida);
    mostrarErroSeInvalido(inputData, erroData, ehDataValida, 'A data de nascimento é obrigatória.');

    ocultarErroSeValido(inputSenha, erroSenha, ehSenhaValida);
    mostrarErroSeInvalido(inputSenha, erroSenha, ehSenhaValida, 'A senha deve ter no mínimo 6 caracteres.');

    // =======================================================
    // ENVIO DO FORMULÁRIO (Trava Final e POST)
    // =======================================================
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Dispara o evento de 'blur' em todos os inputs para forçar mensagens a aparecerem (caso envie em branco)
            if(inputNome) inputNome.dispatchEvent(new Event('blur'));
            if(inputEmail) inputEmail.dispatchEvent(new Event('blur'));
            if(inputCpf) inputCpf.dispatchEvent(new Event('blur'));
            if(inputTelefone) inputTelefone.dispatchEvent(new Event('blur'));
            if(inputData) inputData.dispatchEvent(new Event('blur'));
            if(inputSenha) inputSenha.dispatchEvent(new Event('blur'));

            // Checa se algum Span de erro está aparecendo (não tem a classe d-none)
            const algumErroNaTela = [erroNome, erroEmail, erroCpf, erroTelefone, erroData, erroSenha]
                                    .some(span => span && !span.classList.contains('d-none'));

            if (algumErroNaTela) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return; // Bloqueia o envio
            }

            // Altera o estado do botão para "Cadastrando..."
            const btn = document.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Cadastrando...';
            }

            // Monta os dados para o envio
            const fd = new FormData();
            fd.append('nome', inputNome.value.trim());
            fd.append('email', inputEmail.value.trim());
            fd.append('cpf', inputCpf.value.replace(/\D/g, ''));
            fd.append('telefone', inputTelefone.value.replace(/\D/g, ''));
            fd.append('data_nascimento', inputData.value);
            fd.append('senha', inputSenha.value);
            fd.append('tipo_usuario', 'ResponsavelLegal'); 

            try {
                const resposta = await fetch('../php/usuario_novo.php', {
                    method: 'POST',
                    body: fd
                });

                const dados = await resposta.json();

                if (dados.status === 'ok' || dados.status === 'sucesso') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Responsável cadastrado com sucesso!',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        window.location.href = 'lista_responsavel.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro no Cadastro',
                        text: dados.mensagem || 'Verifique os dados e tente novamente.',
                        confirmButtonColor: '#d33'
                    });
                }
            } catch (erro) {
                console.error("Erro na requisição: ", erro);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de Conexão',
                    text: 'Não foi possível conectar ao servidor.',
                    confirmButtonColor: '#d33'
                });
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Cadastrar Responsável';
                }
            }
        });
    }
});