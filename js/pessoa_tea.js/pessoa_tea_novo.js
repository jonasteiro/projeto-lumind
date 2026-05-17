const formulario = document.getElementById('formCadastroPessoaTea');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

// Função de validar email com regex (texto + @ + texto)
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// CPF
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
    
    // NOVO: Valida o CPF do Responsável
    if (!validarCPF(cpfResponsavel)) {
        document.getElementById('erroCpfResponsavel').textContent = 'CPF inválido (11 dígitos)';
        document.getElementById('erroCpfResponsavel').classList.add('show');
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
    botao.textContent = ' Cadastrando Paciente...';

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

        if (dados.status === 'sucesso') {
            mostrarSucesso('Pessoa Tea cadastrada com sucesso!');
        } else {
            mostrarErro(' Erro: ' + dados.mensagem); 
        }
    } catch (erro) {
        mostrarErro('Erro de conexão com o servidor.');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Cadastrar Paciente';
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

// Formatação ao vivo para os dois campos de CPF
document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});
document.getElementById('cpf_responsavel').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});
