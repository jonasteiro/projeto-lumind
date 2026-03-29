// Elementos do formulário
const formulario = document.getElementById('formCadastroProfissional');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

// Validação de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar idade mínima (18 anos)
function validarIdadeMinima(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return idade >= 18;
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
    const telefone = document.getElementById('telefone').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const especialidade = document.getElementById('especialidade').value;
    const registro = document.getElementById('registro_profissional').value.trim();
    const senha = document.getElementById('senha').value;

    let temErro = false;

    // Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroTelefone').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroEspecialidade').classList.remove('show');
    document.getElementById('erroRegistro').classList.remove('show');
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

    // Validar telefone
    if (telefone.length < 10) {
        document.getElementById('erroTelefone').textContent = 'Telefone inválido';
        document.getElementById('erroTelefone').classList.add('show');
        temErro = true;
    }

    // Validar data de nascimento
    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data de nascimento obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    } else if (!validarIdadeMinima(dataNascimento)) {
        document.getElementById('erroData').textContent = 'Profissional deve ter no mínimo 18 anos';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }

    // Validar especialidade
    if (!especialidade) {
        document.getElementById('erroEspecialidade').textContent = 'Selecione uma especialidade';
        document.getElementById('erroEspecialidade').classList.add('show');
        temErro = true;
    }

    // Validar registro profissional
    if (registro.length < 3) {
        document.getElementById('erroRegistro').textContent = 'Registro profissional inválido';
        document.getElementById('erroRegistro').classList.add('show');
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
        formData.append('nivel', 'profissional');
        formData.append('usuario', document.getElementById('email').value.split('@')[0]); // Usar primeira parte do email como usuário
        formData.append('ativo', document.getElementById('ativo').checked ? 1 : 0);
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('telefone', document.getElementById('telefone').value);
        formData.append('especialidade', document.getElementById('especialidade').value);
        formData.append('registro_profissional', document.getElementById('registro_profissional').value);
        formData.append('instagram', ''); // Deixar vazio

        const resposta = await fetch('../php/cliente_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('✅ Profissional cadastrado com sucesso! Redirecionando...');
        } else {
            mostrarErro('❌ Erro: ' + (dados.mensagem || 'Erro ao cadastrar profissional'));
        }
    } catch (erro) {
        mostrarErro('❌ Erro de conexão: ' + erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Cadastrar Profissional';
    }
});

// Limpar formulário
function limparFormulario() {
    formulario.reset();
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroTelefone').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroEspecialidade').classList.remove('show');
    document.getElementById('erroRegistro').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');
    divErro.classList.remove('show');
    divSucesso.classList.remove('show');
}

// Voltar para perfis
function voltarPerfis() {
    window.location.href = 'index.html';
}

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

document.getElementById('telefone').addEventListener('input', function() {
    if (this.value.length >= 10) {
        document.getElementById('erroTelefone').classList.remove('show');
    }
});

document.getElementById('data_nascimento').addEventListener('change', function() {
    if (validarIdadeMinima(this.value)) {
        document.getElementById('erroData').classList.remove('show');
    }
});

document.getElementById('especialidade').addEventListener('change', function() {
    if (this.value) {
        document.getElementById('erroEspecialidade').classList.remove('show');
    }
});

document.getElementById('registro_profissional').addEventListener('input', function() {
    if (this.value.length >= 3) {
        document.getElementById('erroRegistro').classList.remove('show');
    }
});

document.getElementById('senha').addEventListener('input', function() {
    if (this.value.length >= 6) {
        document.getElementById('erroSenha').classList.remove('show');
    }
});
