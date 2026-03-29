// Elementos do formulário
const formulario = document.getElementById('formCadastroAdm');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

// Validação de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;

    let temErro = false;

    // Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroUsuario').classList.remove('show');
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

    // Validar usuário
    if (usuario.length < 3) {
        document.getElementById('erroUsuario').textContent = 'Usuário deve ter pelo menos 3 caracteres';
        document.getElementById('erroUsuario').classList.add('show');
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
    botao.textContent = '⏳ Criando...';

    try {
        const formData = new FormData(formulario);
        formData.append('nivel', 'adm'); // Sempre admin neste formulário
        formData.append('ativo', document.getElementById('ativo').checked ? 1 : 0);

        const resposta = await fetch('../php/cliente_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('✅ Administrador criado com sucesso! Redirecionando...');
        } else {
            mostrarErro('❌ Erro: ' + (dados.mensagem || 'Erro ao criar administrador'));
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
    document.getElementById('erroUsuario').classList.remove('show');
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

document.getElementById('usuario').addEventListener('input', function() {
    if (this.value.length >= 3) {
        document.getElementById('erroUsuario').classList.remove('show');
    }
});

document.getElementById('senha').addEventListener('input', function() {
    if (this.value.length >= 6) {
        document.getElementById('erroSenha').classList.remove('show');
    }
});
