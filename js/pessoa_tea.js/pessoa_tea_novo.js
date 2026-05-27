// js/pessoa_tea.js/pessoa_tea_novo.js

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById('formCadastroPessoaTea');
    const divErro = document.getElementById('divErro');
    const divSucesso = document.getElementById('divSucesso');

    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // CPF
    function validarCPF(cpf) {
        const apenasNumeros = cpf.replace(/\D/g, ''); 
        return apenasNumeros.length === 11; 
    }

    function mostrarErro(mensagem) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Erro no Cadastro',
                text: mensagem,
                confirmButtonColor: '#d33'
            });
        } else if (divErro) {
            divErro.textContent = mensagem;
            divErro.classList.remove('d-none');
            divSucesso.classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function mostrarSucesso(mensagem) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: mensagem,
                confirmButtonColor: '#0284c7'
            }).then(() => {
                voltarPerfis();
            });
        } else if (divSucesso) {
            divSucesso.textContent = mensagem;
            divSucesso.classList.remove('d-none');
            divErro.classList.add('d-none');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => { voltarPerfis(); }, 2000);
        }
    }

    //Função para validar os campos de acordo com as regras estabelecidas
    function validarCampos() {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const dataNascimento = document.getElementById('data_nascimento').value;
        const nivelTea = document.getElementById('nivel_tea').value;
        const senha = document.getElementById('senha').value;
        
        // NOVO: Pega o CPF do Responsável
        const cpfResponsavel = document.getElementById('cpf_responsavel').value.trim(); 

        let temErro = false;
        
        // Limpar mensagens de erro anteriores (com as novas classes de CSS do Bootstrap)
        const camposErro = ['erroNome', 'erroEmail', 'erroCpf', 'erroCpfResponsavel', 'erroData', 'erroNivel', 'erroSenha'];
        camposErro.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.textContent = '';
        });

        if (nome.length < 3) {
            const el = document.getElementById('erroNome');
            if(el) el.textContent = 'Nome muito curto'; 
            temErro = true; 
        }
        if (!validarEmail(email)) {
            const el = document.getElementById('erroEmail');
            if(el) el.textContent = 'Email inválido';
            temErro = true;
        }
        if (!validarCPF(cpf)) {
            const el = document.getElementById('erroCpf');
            if(el) el.textContent = 'CPF inválido (11 dígitos)';
            temErro = true;
        }
        
        // NOVO: Valida o CPF do Responsável
        if (!validarCPF(cpfResponsavel)) {
            const el = document.getElementById('erroCpfResponsavel');
            if(el) el.textContent = 'CPF inválido (11 dígitos)';
            temErro = true;
        }

        if (!dataNascimento) {
            const el = document.getElementById('erroData');
            if(el) el.textContent = 'Data obrigatória';
            temErro = true;
        }
        if (!nivelTea) {
            const el = document.getElementById('erroNivel');
            if(el) el.textContent = 'Selecione o nível de suporte';
            temErro = true;
        }
        if (senha.length < 6) {
            const el = document.getElementById('erroSenha');
            if(el) el.textContent = 'Mínimo 6 caracteres';
            temErro = true;
        }

        return !temErro;
    }

    if (formulario) {
        formulario.addEventListener('submit', async function(e) { 
            e.preventDefault();

            if (!validarCampos()) return;

            const botao = document.querySelector('button[type="submit"]');
            if(botao) {
                botao.disabled = true;
                botao.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Cadastrando...';
            }

            try {
                const formData = new FormData(); 
                
                formData.append('nome', document.getElementById('nome').value.trim());
                formData.append('email', document.getElementById('email').value.trim());
                formData.append('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
                formData.append('senha', document.getElementById('senha').value);
                formData.append('data_nascimento', document.getElementById('data_nascimento').value);
                formData.append('tipo_usuario', 'PessoaTea'); 
                formData.append('nivel_tea', document.getElementById('nivel_tea').value);
                
                // NOVO: Envia o CPF do responsável (apenas números)
                formData.append('cpf_responsavel', document.getElementById('cpf_responsavel').value.replace(/\D/g, ''));

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
                    mostrarSucesso('Paciente (TEA) cadastrado com sucesso!');
                } else {
                    mostrarErro(dados.mensagem || 'Erro ao cadastrar.'); 
                }
            } catch (erro) {
                mostrarErro('Erro de conexão com o servidor.');
                console.error(erro);
            } finally {
                if(botao) {
                    botao.disabled = false;
                    botao.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Cadastrar Paciente';
                }
            }
        });
    }

    function voltarPerfis() {
        window.location.href = 'lista_pessoa_tea.html';
    }

    // Formatação ao vivo para os dois campos de CPF
    const inputCpf = document.getElementById('cpf');
    if (inputCpf) {
        inputCpf.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }
    
    const inputCpfResp = document.getElementById('cpf_responsavel');
    if (inputCpfResp) {
        inputCpfResp.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }
});