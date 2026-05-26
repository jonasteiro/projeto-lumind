const formulario = document.getElementById('formCadastroAdm');
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

// CORREÇÃO: Nova função baseada em Regex para senha forte
function validarSenhaForte(senha) {
    // Exige: mín 8 chars, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
}

function mostrarErro(mensagem) {
    divErro.textContent = mensagem;
    divErro.classList.add('show');
    divSucesso.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validarCampos() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const senha = document.getElementById('senha').value;

    let temErro = false;

    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');

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

    if (!dataNascimento) {
        document.getElementById('erroData').textContent = 'Data de nascimento obrigatória';
        document.getElementById('erroData').classList.add('show');
        temErro = true;
    }

    // CORREÇÃO: Substituindo a validação antiga pela validação da senha forte
    if (!validarSenhaForte(senha)) {
        document.getElementById('erroSenha').textContent = 'A senha não atende aos requisitos de segurança.';
        document.getElementById('erroSenha').classList.add('show');
        temErro = true;
    }

    return !temErro;
}

formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validarCampos()) {
        return;
    }

    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = '⏳ Cadastrando...';

    try {
        const formData = new FormData();

        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value);
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('senha', document.getElementById('senha').value);
        formData.append('tipo_usuario', 'Administrador');

        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Administrador cadastrado com sucesso!',
                confirmButtonColor: '#0284c7',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '../home/lista_administrador.html';
            });
        } else {
            mostrarErro(' Erro: ' + (dados.mensagem || 'Erro ao cadastrar administrador'));
        }
    } catch (erro) {
        mostrarErro(' Erro de conexão: ' + erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Criar Administrador';
    }
});

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

function voltarPerfis() {
    window.location.href = '../home/lista_administrador.html';
}

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

// CORREÇÃO: O erro só some em tempo real quando o usuário atende à regex
document.getElementById('senha').addEventListener('input', function() {
    if (validarSenhaForte(this.value)) {
        document.getElementById('erroSenha').classList.remove('show');
    }
});