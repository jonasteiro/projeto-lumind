// Elementos do formulário
const formulario = document.getElementById('formCadastroAdm');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

// Validação de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validação de CPF (Exatamente 11 números)
function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

// Mostrar erro
function mostrarErro(mensagem) {
    divErro.textContent = mensagem;
    divErro.classList.add('show');
    divSucesso.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar sucesso
function mostrarSucesso(mensagem) {
    divSucesso.textContent = mensagem;
    divSucesso.classList.add('show');
    divErro.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        voltarPerfis();
    }, 2000);
}

// Validar campos individuais
function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const senha = document.getElementById('senha').value;

    let temErro = false;

    // Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');

    // Validar nome
    if (nome.length < 3) {
        document.getElementById('erroNome').textContent = 'Nome deve ter pelo menos 3 caracteres';
        document.getElementById('erroNome').classList.add('show');
        temErro = true;
    }

    // Validar email
    if (!validarEmail(email)) {
        document.getElementById('erroEmail').textContent = 'Email inválido';
        document.getElementById('erroEmail').classList.add('show');
        temErro = true;
    }

    // Validar CPF
    if (!validarCPF(cpf)) {
        document.getElementById('erroCpf').textContent = 'O CPF deve ter exatamente 11 números';
        document.getElementById('erroCpf').classList.add('show');
        temErro = true;
    }

    // Validar data de nascimento
    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data de nascimento obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }

    // Validar senha
    if (senha.length < 6) {
        document.getElementById('erroSenha').textContent = 'Senha deve ter no mínimo 6 caracteres';
        document.getElementById('erroSenha').classList.add('show');
        temErro = true;
    }

    return !temErro;
}

// Enviar formulário
formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validar campos
    if (!validarCampos()) {
        return;
    }

    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = '⏳ Cadastrando...';

    try {
        const formData = new FormData(formulario);
        
        // Define o tipo de usuário para o PHP
        formData.append('tipo_usuario', 'Administrador'); 
        
        // Limpa o CPF para enviar apenas os números para o banco
        formData.set('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));

        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('✅ Administrador cadastrado com sucesso! Redirecionando...');
        } else {
            mostrarErro('❌ Erro: ' + (dados.mensagem || 'Erro ao cadastrar administrador'));
        }
    } catch (erro) {
        mostrarErro('❌ Erro de conexão: ' + erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Criar Administrador';
    }
});

// Limpar formulário
function limparFormulario() {
    formulario.reset();
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');
    divErro.classList.remove('show');
    divSucesso.classList.remove('show');
}

// Voltar para perfis (Adapte para a URL correta do seu painel)
function voltarPerfis() {
    window.location.href = 'painel_admin.html';
}

// ================= MÁSCARAS E EVENTOS EM TEMPO REAL =================

// Limpar mensagens de erro ao digitar
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

// Máscara e validação em tempo real para o CPF
document.getElementById('cpf').addEventListener('input', function() {
    // Apaga instantaneamente letras e espaços
    this.value = this.value.replace(/\D/g, '');
    
    if (validarCPF(this.value)) {
        document.getElementById('erroCpf').classList.remove('show');
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