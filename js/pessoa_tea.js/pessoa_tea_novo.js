const formulario = document.getElementById('formCadastroPessoaTea');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');


function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
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
    setTimeout(() => { voltarPerfis(); }, 2000);
}


function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const nivelTea = document.getElementById('nivel_tea').value;
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
        document.getElementById('erroCpf').textContent = 'CPF inválido (11 dígitos)';
        document.getElementById('erroCpf').classList.add('show');
        temErro = true;
    }
    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }
    if (!nivelTea) {
        document.getElementById('erroNivel').textContent = 'Selecione o nível de suporte';
        document.getElementById('erroNivel').classList.add('show');
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
    botao.textContent = '⏳ Cadastrando Paciente...';

    try {
        const formData = new FormData(formulario);
        
        formData.append('tipo_usuario', 'PessoaTea'); 
        
        formData.set('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
        const tel = document.getElementById('telefone').value.replace(/\D/g, '');
        if(tel) formData.set('telefone', tel);

        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('✅ Paciente cadastrado com sucesso!');
        } else {
            mostrarErro('❌ Erro: ' + dados.mensagem);
        }
    } catch (erro) {
        mostrarErro('❌ Erro de conexão com o servidor.');
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Cadastrar Paciente';
    }
});


function limparFormulario() {
    formulario.reset();
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    divErro.classList.remove('show');
    divSucesso.classList.remove('show');
}

function voltarPerfis() {
    window.location.href = 'lista_pessoa_tea.html';
}

document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});