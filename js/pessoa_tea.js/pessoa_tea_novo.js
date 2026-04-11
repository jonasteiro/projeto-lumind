const formulario = document.getElementById('formCadastroPessoaTea');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');
// Acima são variáveis globais

// Função de validar email com regex (texto + @ + texto)
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// CPF
function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, ''); //Tira qualquer coisa que não é número
    return apenasNumeros.length === 11; // Só  pode ter 11 dígitos (tamanho padrão do cpf)
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
    // .trim retira os espaços em branco no começo e fim do texto
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const dataNascimento = document.getElementById('data_nascimento').value;
    const nivelTea = document.getElementById('nivel_tea').value;
    const senha = document.getElementById('senha').value;

    //INSERIR AS VARIAVEIS DO CAMPO E DO ERRO AQUI
    /*
    const email_exercicio = document.getElementById('email_exercicio').value;
    const erro_exercicio = document.getElementById('erro_exercicio'); // NÃO COLOCAR .VALUE (Não tem valor para pegar)
    // */


    //temErro = false > tudo está certo até que entre no if
    let temErro = false;
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));

    if (nome.length < 3) {
        document.getElementById('erroNome').textContent = 'Nome muito curto'; //erroNome está como Span no html abaixo da variável
        document.getElementById('erroNome').classList.add('show'); //classList.add > Mostra o erro na tela
        temErro = true; // Confirma que há um erro
    }
    // !validarEmail(linha 7) > se a função de validar retornar erro
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

    //Campo para colocar o exercício
    // --------------------------------
    /*
    if(email_exercicio.includes("@")){
        console.log("ok");
    }else{
        //ERRO VAI NESSE ELSE
        erro_exercicio.textContent = "Email sem @"; //textContent é o método para escrever no erro do html
        temErro = true;
    } 
   // ---------------------------------
   // */

    // !temErro > Não tem erro nos ifs e pode passar
    return !temErro;
}

formulario.addEventListener('submit', async function(e) { //submit para enviar clicando Enter também
    e.preventDefault();

    if (!validarCampos()) return;

    //Desativa o botão de cadastro quando clicar para que não haja cliques excessivos
    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = ' Cadastrando Paciente...';

    try {
        const formData = new FormData(); 
        
        // 2. Empacotamos manualmente pegando por ID, combinando com as variáveis do PHP
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
        formData.append('senha', document.getElementById('senha').value);
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('tipo_usuario', 'PessoaTea'); // Dado fixo
        formData.append('nivel_tea', document.getElementById('nivel_tea').value);
        
        // Telefone (só envia se existir e tira a formatação)
        const valTelefone = document.getElementById('telefone');
        if(valTelefone && valTelefone.value) {
            formData.append('telefone', valTelefone.value.replace(/\D/g, ''));
        }

        // Observação
        const valObservacao = document.getElementById('observacao');
        if(valObservacao) {
            formData.append('observacao', valObservacao.value.trim());
        }

        // Requisição pro servidor (await = "não faz nada até ter resposta")
        const resposta = await fetch('../php/usuario_novo.php', {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (dados.status === 'sucesso') {
            mostrarSucesso('Pessoa Tea cadastrada com sucesso!');
        } else {
            mostrarErro(' Erro: ' + dados.mensagem); //dados.mensagem é erros que o PHP identificou
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

//retorna para a tela de listagem
function voltarPerfis() {
    window.location.href = 'lista_pessoa_tea.html';
}

//Ele já coloca qualquer coisa que não é número como espaço em branco "ao vivo" no cpf
document.getElementById('cpf').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});