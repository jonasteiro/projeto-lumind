const formulario = document.getElementById('formCadastroResponsavel');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

function validarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
}

function mostrarErro(mensagem) {
    divErro.textContent = mensagem;
    divErro.classList.add('show');
    divSucesso.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarSucesso(mensagem) {
    divSucesso.textContent = mensagem;
    divSucesso.classList.add('show');
    divErro.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        voltarPerfis();
    }, 2000);
}

function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const senha = document.getElementById('senha').value;

    let temErro = false;

    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));

    if (nome.length < 3) {
        document.getElementById('erroNome').textContent = 'Nome muito curto';
        document.getElementById('erroNome').classList.add('show');
        temErro = true;
    }

    if (!validarEmail(email)) {
        document.getElementById('erroEmail').textContent = 'Email inválido';
        document.getElementById('erroEmail').classList.add('show');
        temErro = true;
    }

    if (!validarCPF(cpf)) {
        document.getElementById('erroCpf').textContent = 'CPF deve ter 11 dígitos';
        document.getElementById('erroCpf').classList.add('show');
        temErro = true;
    }

    if (!validarTelefone(telefone)) {
        document.getElementById('erroTelefone').textContent = 'Telefone inválido';
        document.getElementById('erroTelefone').classList.add('show');
        temErro = true;
    }

    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }

    if (senha.length < 6) {
        document.getElementById('erroSenha').textContent = 'Mínimo 6 caracteres';
        document.getElementById('erroSenha').classList.add('show');
        temErro = true;
    }

    return !temErro;
}

formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validarCampos()) return;

    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.innerHTML = '<span>⏳</span> Cadastrando...';

    try {
        const formData = new FormData(); 
        
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
        formData.append('telefone', document.getElementById('telefone').value.replace(/\D/g, ''));
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('senha', document.getElementById('senha').value);
        
        // Define o tipo de usuário para o PHP
        formData.append('tipo_usuario', 'ResponsavelLegal'); 
        // --- FIM DA PADRONIZAÇÃO ---

        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('Responsável cadastrado com sucesso!');
        } else {
            mostrarErro('Erro: ' + dados.mensagem);
        }
    } catch (erro) {
        mostrarErro('Erro de conexão com o servidor.');
    } finally {
        botao.disabled = false;
        botao.innerHTML = '<span>💾</span> Cadastrar Responsável';
    }
});

function limparFormulario() {
    formulario.reset();
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    divErro.classList.remove('show');
    divSucesso.classList.remove('show');
}

function voltarPerfis() {
    window.location.href = 'lista_responsavel.html';
}

document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});

document.getElementById('telefone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});