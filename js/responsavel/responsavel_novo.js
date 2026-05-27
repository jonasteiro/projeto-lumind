document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCadastroResponsavel");

    // Funções de validação
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validarCPF(cpf) {
        const apenasNumeros = cpf.replace(/\D/g, ''); 
        return apenasNumeros.length === 11; 
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Impede o envio padrão e o recarregamento da página

            // Limpa as mensagens de erro anteriores da tela
            const camposErro = ['erroNome', 'erroEmail', 'erroCpf', 'erroTelefone', 'erroData', 'erroSenha'];
            camposErro.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.textContent = '';
            });

            // Captura os valores
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const cpf = document.getElementById("cpf").value.trim();
            const telefone = document.getElementById("telefone").value.trim();
            const dataNascimento = document.getElementById("data_nascimento").value;
            const senha = document.getElementById("senha").value;

            let temErro = false;

            // Validações
            if (nome.length < 3) {
                document.getElementById("erroNome").textContent = "Nome muito curto.";
                temErro = true;
            }
            if (!validarEmail(email)) {
                document.getElementById("erroEmail").textContent = "Email inválido.";
                temErro = true;
            }
            if (!validarCPF(cpf)) {
                document.getElementById("erroCpf").textContent = "CPF inválido (11 dígitos).";
                temErro = true;
            }
            if (telefone.replace(/\D/g, '').length < 10) {
                document.getElementById("erroTelefone").textContent = "Telefone inválido (inclua DDD).";
                temErro = true;
            }
            if (!dataNascimento) {
                document.getElementById("erroData").textContent = "Data obrigatória.";
                temErro = true;
            }
            if (senha.length < 6) {
                document.getElementById("erroSenha").textContent = "Mínimo 6 caracteres.";
                temErro = true;
            }

            // Se houver algum erro, para a execução aqui
            if (temErro) return;

            // Altera o estado do botão para "Cadastrando..."
            const btn = document.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Cadastrando...';
            }

            // Monta os dados para o envio
            const fd = new FormData();
            fd.append('nome', nome);
            fd.append('email', email);
            fd.append('cpf', cpf.replace(/\D/g, '')); // Envia só os números
            fd.append('telefone', telefone.replace(/\D/g, '')); // Envia só os números
            fd.append('data_nascimento', dataNascimento);
            fd.append('senha', senha);
            fd.append('tipo_usuario', 'ResponsavelLegal'); // Identificador para o backend

            try {
                // Realiza a requisição ao backend PHP
                const resposta = await fetch('../php/usuario_novo.php', {
                    method: 'POST',
                    body: fd
                });

                const dados = await resposta.json();

                if (dados.status === 'ok' || dados.status === 'sucesso') {
                    // Exibe o SweetAlert de Sucesso
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Responsável cadastrado com sucesso!',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        // Redireciona APÓS o usuário clicar no OK do alerta
                        window.location.href = 'lista_responsavel.html';
                    });
                } else {
                    // Exibe o SweetAlert de Erro (ex: CPF já existe)
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
                // Restaura o botão caso dê erro e a pessoa precise tentar de novo
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Cadastrar Responsável';
                }
            }
        });
    }

    // Impede a digitação de letras nos campos de CPF e Telefone (apenas números)
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
});