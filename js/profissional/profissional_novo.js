document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-cadastro-prof');

    // =======================================================
    // BLOQUEIO DE DATAS FUTURAS NO CALENDÁRIO
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
    // MÁSCARAS EM TEMPO REAL (Apenas Números)
    // =======================================================
    const inputCpf = document.getElementById('cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    const inputTelefone = document.getElementById('telefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 15);
        });
    }

    // =======================================================
    // FUNÇÕES DE VALIDAÇÃO DE REGRAS
    // =======================================================
    const ehNomeValido = (val) => val.trim().length >= 3;
    const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const validarCPF = (cpf) => cpf.replace(/\D/g, '').length === 11;
    const ehTextoValido = (val) => val.trim() !== "";
    const ehSenhaValida = (val) => val.length >= 6;

    // =======================================================
    // EVENTOS: MOSTRAR E ESCONDER ERROS EM TEMPO REAL
    // =======================================================
    const inputNome = document.getElementById('nome');
    const erroNome = document.getElementById('erroNome');

    const inputEmail = document.getElementById('email');
    const erroEmail = document.getElementById('erroEmail');

    const erroCpf = document.getElementById('erroCpf');
    const erroData = document.getElementById('erroData');

    const inputRegistro = document.getElementById('registro_profissional');
    const erroRegistro = document.getElementById('erroRegistro');

    const inputEspecialidade = document.getElementById('especialidade');
    const erroEspecialidade = document.getElementById('erroEspecialidade');

    const inputSenha = document.getElementById('senha');
    const erroSenha = document.getElementById('erroSenha');

    // Oculta o erro na hora que o usuário começa a digitar corretamente
    function ocultarErroSeValido(input, erroElemento, validacaoFn) {
        if(!input || !erroElemento) return;
        const checar = () => {
            if (validacaoFn(input.value)) {
                erroElemento.classList.add('d-none');
                erroElemento.classList.remove('show'); // Mantido por compatibilidade com seu CSS antigo
            }
        };
        input.addEventListener('input', checar);
        input.addEventListener('change', checar);
        input.addEventListener('keyup', checar);
    }

    // Mostra o erro quando o usuário tira o mouse/foco do campo (blur)
    function mostrarErroSeInvalido(input, erroElemento, validacaoFn, msgInvalido) {
        if(!input || !erroElemento) return;
        input.addEventListener('blur', () => {
            if (!validacaoFn(input.value)) {
                erroElemento.textContent = msgInvalido;
                erroElemento.classList.remove('d-none');
                erroElemento.classList.add('show');
            }
        });
    }

    // Aplicando nos campos
    ocultarErroSeValido(inputNome, erroNome, ehNomeValido);
    mostrarErroSeInvalido(inputNome, erroNome, ehNomeValido, 'O nome deve ter pelo menos 3 caracteres.');

    ocultarErroSeValido(inputEmail, erroEmail, validarEmail);
    mostrarErroSeInvalido(inputEmail, erroEmail, validarEmail, 'Insira um formato de e-mail válido.');

    ocultarErroSeValido(inputCpf, erroCpf, validarCPF);
    mostrarErroSeInvalido(inputCpf, erroCpf, validarCPF, 'O CPF deve ter exatamente 11 números.');

    ocultarErroSeValido(inputRegistro, erroRegistro, ehTextoValido);
    mostrarErroSeInvalido(inputRegistro, erroRegistro, ehTextoValido, 'O registro profissional é obrigatório.');

    ocultarErroSeValido(inputEspecialidade, erroEspecialidade, ehTextoValido);
    mostrarErroSeInvalido(inputEspecialidade, erroEspecialidade, ehTextoValido, 'A especialidade é obrigatória.');

    ocultarErroSeValido(inputData, erroData, ehTextoValido);
    mostrarErroSeInvalido(inputData, erroData, ehTextoValido, 'A data de nascimento é obrigatória.');

    ocultarErroSeValido(inputSenha, erroSenha, ehSenhaValida);
    mostrarErroSeInvalido(inputSenha, erroSenha, ehSenhaValida, 'A senha deve ter no mínimo 6 caracteres.');

    // =======================================================
    // ENVIO DO FORMULÁRIO
    // =======================================================
    if (formulario) {
        formulario.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Dispara o 'blur' manualmente em todos os campos para forçar a exibição de erros caso envie vazio
            if(inputNome) inputNome.dispatchEvent(new Event('blur'));
            if(inputEmail) inputEmail.dispatchEvent(new Event('blur'));
            if(inputCpf) inputCpf.dispatchEvent(new Event('blur'));
            if(inputRegistro) inputRegistro.dispatchEvent(new Event('blur'));
            if(inputEspecialidade) inputEspecialidade.dispatchEvent(new Event('blur'));
            if(inputData) inputData.dispatchEvent(new Event('blur'));
            if(inputSenha) inputSenha.dispatchEvent(new Event('blur'));

            // Verifica os arquivos
            const cert = document.getElementsByName('certificacao_profissional')[0];
            const iden = document.getElementsByName('carteira_identidade_nacional')[0];
            const erroCertificacao = document.getElementById('erroCertificacao');
            const erroIdentidade = document.getElementById('erroIdentidade');

            let temErroArquivo = false;

            if (cert && cert.files.length === 0) {
                if (erroCertificacao) {
                    erroCertificacao.textContent = 'Certificação profissional é obrigatória.';
                    erroCertificacao.classList.remove('d-none', 'show');
                }
                temErroArquivo = true;
            } else if (erroCertificacao) {
                erroCertificacao.classList.add('d-none');
            }

            if (iden && iden.files.length === 0) {
                if (erroIdentidade) {
                    erroIdentidade.textContent = 'Identidade nacional é obrigatória.';
                    erroIdentidade.classList.remove('d-none', 'show');
                }
                temErroArquivo = true;
            } else if (erroIdentidade) {
                erroIdentidade.classList.add('d-none');
            }

            // Checa se algum Span de erro de texto está visível (não tem d-none)
            const algumErroNaTela = [erroNome, erroEmail, erroCpf, erroRegistro, erroEspecialidade, erroData, erroSenha]
                                    .some(span => span && !span.classList.contains('d-none'));

            if (algumErroNaTela || temErroArquivo) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return; // Bloqueia o envio se tiver erro na tela
            }

            // ==================================
            // TUDO CERTO! PREPARA O ENVIO (POST)
            // ==================================
            const botao = document.getElementById('btn-cadastrar');
            if (botao) {
                botao.disabled = true;
                botao.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processando...';
            }

            try {
                const formData = new FormData(); 
                
                formData.append('nome', inputNome.value.trim());
                formData.append('email', inputEmail.value.trim());
                formData.append('cpf', inputCpf.value);
                formData.append('registro_profissional', inputRegistro.value.trim());
                formData.append('especialidade', inputEspecialidade.value.trim());
                formData.append('data_nascimento', inputData.value);
                formData.append('senha', inputSenha.value);
                
                if (inputTelefone && inputTelefone.value) {
                    formData.append('telefone', inputTelefone.value.replace(/\D/g, ''));
                }

                formData.append('tipo_usuario', 'ProfissionalSaude'); 

                if (cert.files.length > 0) formData.append('certificacao_profissional', cert.files[0]);
                if (iden.files.length > 0) formData.append('carteira_identidade_nacional', iden.files[0]);

                const resposta = await fetch('../php/usuario_novo.php', {
                    method: 'POST',
                    body: formData
                });

                const dados = await resposta.json();

                if (dados.status === 'sucesso' || dados.status === 'ok') {
                    // Modal Elegante de Sucesso com SweetAlert
                    Swal.fire({
                        title: 'Solicitação Enviada!',
                        text: dados.mensagem || 'Seu cadastro foi enviado e está sob análise. Aguarde nosso retorno!',
                        icon: 'success',
                        confirmButtonText: 'Ir para o Login',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        window.location.href = '../login/index.html';
                    });
                    formulario.reset();
                } else {
                    // Modal Elegante de Erro (ex: CPF já cadastrado)
                    Swal.fire({
                        title: 'Atenção!',
                        text: dados.mensagem || 'Erro ao processar sua solicitação.',
                        icon: 'error',
                        confirmButtonText: 'Revisar Dados',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (erro) {
                console.error("Erro na requisição: ", erro);
                Swal.fire({
                    title: 'Erro de Conexão',
                    text: 'Não foi possível conectar ao servidor. Verifique sua internet.',
                    icon: 'error',
                    confirmButtonText: 'Fechar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                if (botao) {
                    botao.disabled = false;
                    botao.innerHTML = '<span>💾</span> Enviar Solicitação';
                }
            }
        });
    }

    // Tira os avisos de erro de arquivo assim que o usuário escolhe um arquivo
    const cert = document.getElementsByName('certificacao_profissional')[0];
    if (cert) {
        cert.addEventListener('change', () => {
            const erroCertificacao = document.getElementById('erroCertificacao');
            if (erroCertificacao) erroCertificacao.classList.add('d-none');
        });
    }

    const iden = document.getElementsByName('carteira_identidade_nacional')[0];
    if (iden) {
        iden.addEventListener('change', () => {
            const erroIdentidade = document.getElementById('erroIdentidade');
            if (erroIdentidade) erroIdentidade.classList.add('d-none');
        });
    }
});