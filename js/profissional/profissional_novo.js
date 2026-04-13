const formulario = document.getElementById('form-cadastro-prof');
const divErro = document.getElementById('mensagem-retorno'); 
const divSucesso = document.getElementById('mensagem-retorno'); 

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validação de CPF
function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

// Mostrar erro
function mostrarErro(mensagem) {
    divErro.textContent = ' ' + mensagem;
    divErro.className = 'alert alert-danger show';
    divErro.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar sucesso
function mostrarSucesso(mensagem) {
    divErro.textContent = '' + mensagem;
    divErro.className = 'alert alert-success show';
    divErro.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        window.location.href = '../login/index.html';
    }, 3000);
}

// Validar campos individuais
function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const registro = document.getElementById('registro_profissional').value.trim();
    const especialidade = document.getElementById('especialidade').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const senha = document.getElementById('senha').value;
    
    // Arquivos
    const cert = document.getElementsByName('certificacao_profissional')[0];
    const iden = document.getElementsByName('carteira_identidade_nacional')[0];

    let temErro = false;

    // Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroRegistro').classList.remove('show');
    document.getElementById('erroEspecialidade').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');
    document.getElementById('erroCertificacao').classList.remove('show');
    document.getElementById('erroIdentidade').classList.remove('show');

    if (nome.length < 3) {
        document.getElementById('erroNome').textContent = 'Nome deve ter pelo menos 3 caracteres';
        document.getElementById('erroNome').classList.add('show');
        temErro = true;
    }

    if (!validarEmail(email)) {
        document.getElementById('erroEmail').textContent = 'Email inválido';
        document.getElementById('erroEmail').classList.add('show');
        temErro = true;
    }

    if (!validarCPF(cpf)) {
        document.getElementById('erroCpf').textContent = 'O CPF deve ter exatamente 11 números';
        document.getElementById('erroCpf').classList.add('show');
        temErro = true;
    }

    if (registro === '') {
        document.getElementById('erroRegistro').textContent = 'Registro profissional obrigatório';
        document.getElementById('erroRegistro').classList.add('show');
        temErro = true;
    }

    if (especialidade === '') {
        document.getElementById('erroEspecialidade').textContent = 'Especialidade obrigatória';
        document.getElementById('erroEspecialidade').classList.add('show');
        temErro = true;
    }

    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data de nascimento obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }

    if (senha.length < 6) {
        document.getElementById('erroSenha').textContent = 'Senha deve ter no mínimo 6 caracteres';
        document.getElementById('erroSenha').classList.add('show');
        temErro = true;
    }

    // Validação dos arquivos
    if (cert.files.length === 0) { //Se lenght for 0 então não subiu nada para a página
        document.getElementById('erroCertificacao').classList.add('show');
        temErro = true;
    }
    if (iden.files.length === 0) { //Se lenght for 0 então não subiu nada para a página
        document.getElementById('erroIdentidade').classList.add('show');
        temErro = true;
    }

    return !temErro;
}

// Enviar formulário
formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validarCampos()) {
        return;
    }

    // Botão desativado para impedir multiplas tentativas de clique
    const botao = document.getElementById('btn-cadastrar');
    botao.disabled = true;
    botao.innerHTML = '<span></span> Processando...';

    try {
        const formData = new FormData(); 
        
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value);
        formData.append('registro_profissional', document.getElementById('registro_profissional').value.trim());
        formData.append('especialidade', document.getElementById('especialidade').value.trim());
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('senha', document.getElementById('senha').value);
        
        const telInput = document.getElementById('telefone');
        if (telInput && telInput.value) {
            formData.append('telefone', telInput.value.replace(/\D/g, ''));
        }

        formData.append('tipo_usuario', 'ProfissionalSaude'); 

        const inputCert = document.getElementsByName('certificacao_profissional')[0];
        if (inputCert.files.length > 0) {
            formData.append('certificacao_profissional', inputCert.files[0]);
        }

        const inputIden = document.getElementsByName('carteira_identidade_nacional')[0];
        if (inputIden.files.length > 0) {
            formData.append('carteira_identidade_nacional', inputIden.files[0]);
        }

        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso(dados.mensagem || 'Solicitação enviada com sucesso!');
            formulario.reset();
        } else {
            mostrarErro(dados.mensagem || 'Erro ao processar solicitação');
        }
    } catch (erro) {
        mostrarErro('Erro de conexão: ' + erro.message);
    } finally {
        botao.disabled = false;
        botao.innerHTML = '<span>💾</span> Enviar Solicitação';
    }
});

// tempo real (digitação)

// Apaga instantaneamente letras e espaços, deixando só números
document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});

// Se o campo telefone existir na tela, aplica a mesma máscara
const campoTelefone = document.getElementById('telefone');
if (campoTelefone) {
    campoTelefone.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });
}