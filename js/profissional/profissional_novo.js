// Elementos do formulário (Seguindo seu padrão de nomes)
const formulario = document.getElementById('form-cadastro-prof');
const divErro = document.getElementById('mensagem-retorno'); // Sua div de erro global
const divSucesso = document.getElementById('mensagem-retorno'); // No seu HTML é a mesma div

// Validação de email
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

// Validar campos individuais (Padronizado com seus IDs)
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

    // Validação dos arquivos (A única exceção necessária)
    if (cert.files.length === 0) {
        document.getElementById('erroCertificacao').classList.add('show');
        temErro = true;
    }
    if (iden.files.length === 0) {
        document.getElementById('erroIdentidade').classList.add('show');
        temErro = true;
    }

    return !temErro;
}

// Enviar formulário (Lógica fiel ao do Admin)
formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validarCampos()) {
        return;
    }

    const botao = document.getElementById('btn-cadastrar');
    botao.disabled = true;
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    
    btnText.textContent = ' Processando...';
    btnSpinner.classList.remove('d-none');

    try {
        const formData = new FormData(formulario);
        
        // Mantendo a padronização de tipos e limpeza de strings
        formData.append('tipo_usuario', 'ProfissionalSaude'); 
        formData.set('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
        
        const telefoneVal = document.getElementById('telefone').value.replace(/\D/g, '');
        formData.set('telefone', telefoneVal);

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
        btnText.textContent = 'Enviar Solicitação';
        btnSpinner.classList.add('d-none');
    }
});

// EVENTOS EM TEMPO REAL

document.getElementById('nome').addEventListener('input', function() {
    if (this.value.length >= 3) {
        document.getElementById('erroNome').classList.remove('show');
    }
});

document.getElementById('email').addEventListener('input', function() {
    if (validarEmail(this.value)) {
        document.getElementById('erroEmail').classList.remove('show');
    }
});

document.getElementById('cpf').addEventListener('input', function() {
    // Apaga instantaneamente letras e espaços
    this.value = this.value.replace(/\D/g, '');
    
    if (validarCPF(this.value)) {
        document.getElementById('erroCpf').classList.remove('show');
    }
});

document.getElementById('registro_profissional').addEventListener('input', function() {
    if (this.value.trim() !== '') {
        document.getElementById('erroRegistro').classList.remove('show');
    }
});

document.getElementById('especialidade').addEventListener('input', function() {
    if (this.value.trim() !== '') {
        document.getElementById('erroEspecialidade').classList.remove('show');
    }
});

document.getElementById('data_nascimento').addEventListener('change', function() {
    if (this.value) {
        document.getElementById('erroData').classList.remove('show');
    }
});

document.getElementById('senha').addEventListener('input', function() {
    if (this.value.length >= 6) {
        document.getElementById('erroSenha').classList.remove('show');
    }
});

// Arquivos (Mantendo o padrão de chaves do projeto)
document.getElementsByName('certificacao_profissional')[0].addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('erroCertificacao').classList.remove('show');
    }
});

document.getElementsByName('carteira_identidade_nacional')[0].addEventListener('change', function() {
    if (this.files.length > 0) {
        document.getElementById('erroIdentidade').classList.remove('show');
    }
});