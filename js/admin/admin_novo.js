const formulario = document.getElementById('formCadastroAdm');
const divErro = document.getElementById('divErro');
const divSucesso = document.getElementById('divSucesso');

const inputNome = document.getElementById('nome');
const erroNome = document.getElementById('erroNome');

const inputEmail = document.getElementById('email');
const erroEmail = document.getElementById('erroEmail');

const inputCpf = document.getElementById('cpf');
const erroCpf = document.getElementById('erroCpf');

const inputData = document.getElementById('data_nascimento');
const erroData = document.getElementById('erroData');

const inputSenha = document.getElementById('senha');
const erroSenha = document.getElementById('erroSenha');

// ==========================================
// 1. BLOQUEIO DE DATAS FUTURAS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (inputData) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        
        // Impede de clicar em dias além de "hoje" no calendário HTML
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`);
    }
});

// ==========================================
// 2. FUNÇÕES DE VALIDAÇÃO (Regras)
// ==========================================
const ehNomeValido = (val) => val.trim().length >= 3;
const ehEmailValido = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
const ehCpfValido = (val) => val.replace(/\D/g, '').length === 11;
const ehSenhaForte = (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val);
const ehMaiorDeIdade = (val) => {
    if (!val) return false;
    const dataNasc = new Date(val);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNasc = dataNasc.getMonth();
    const diaNasc = dataNasc.getDate();

    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--;
    }
    return idade >= 18;
};

// ==========================================
// 3. EVENTOS: MOSTRAR E ESCONDER ERROS EM TEMPO REAL
// ==========================================

// Função que ESCUTA O TECLADO e oculta o erro assim que o dado fica correto
function ocultarErroSeValido(input, erroElemento, validacaoFn) {
    const checar = () => {
        if (validacaoFn(input.value)) {
            erroElemento.classList.remove('show');
            if (divErro) divErro.classList.remove('show'); // Limpa a faixa vermelha global tbm
        }
    };
    input.addEventListener('input', checar);
    input.addEventListener('change', checar);
    input.addEventListener('keyup', checar); // Garante que a digitação apague o erro
}

// Função que mostra o erro apenas quando o usuário SAI DO CAMPO (blur) e deixou errado
function mostrarErroSeInvalido(input, erroElemento, validacaoFn, msgInvalido, msgVazio = 'Campo obrigatório') {
    input.addEventListener('blur', () => {
        if (input.value.trim().length > 0 && !validacaoFn(input.value)) {
            erroElemento.textContent = msgInvalido;
            erroElemento.classList.add('show');
        } else if (input.value.trim().length === 0) {
            erroElemento.textContent = msgVazio;
            erroElemento.classList.add('show');
        }
    });
}

// --- Aplicando nos campos ---
ocultarErroSeValido(inputNome, erroNome, ehNomeValido);
mostrarErroSeInvalido(inputNome, erroNome, ehNomeValido, 'O nome deve ter pelo menos 3 caracteres');

ocultarErroSeValido(inputEmail, erroEmail, ehEmailValido);
mostrarErroSeInvalido(inputEmail, erroEmail, ehEmailValido, 'Formato de e-mail inválido');

inputCpf.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, ''); // Força apenas números no CPF
});
ocultarErroSeValido(inputCpf, erroCpf, ehCpfValido);
mostrarErroSeInvalido(inputCpf, erroCpf, ehCpfValido, 'O CPF deve ter exatamente 11 números');

ocultarErroSeValido(inputData, erroData, ehMaiorDeIdade);
mostrarErroSeInvalido(inputData, erroData, ehMaiorDeIdade, 'O administrador deve ter no mínimo 18 anos', 'A data de nascimento é obrigatória');

ocultarErroSeValido(inputSenha, erroSenha, ehSenhaForte);
mostrarErroSeInvalido(inputSenha, erroSenha, ehSenhaForte, 'A senha deve ter mín 8 chars, 1 maiúscula, 1 número e 1 caractere especial');


// ==========================================
// 4. VALIDAÇÃO FINAL NO SUBMIT
// ==========================================
function validarCamposSubmit() {
    let temErro = false;

    // Dispara manualmente o blur em todos os campos para forçar as mensagens de erro aparecerem caso ele tente enviar tudo em branco
    inputNome.dispatchEvent(new Event('blur'));
    inputEmail.dispatchEvent(new Event('blur'));
    inputCpf.dispatchEvent(new Event('blur'));
    inputData.dispatchEvent(new Event('blur'));
    inputSenha.dispatchEvent(new Event('blur'));

    if (erroNome.classList.contains('show') || 
        erroEmail.classList.contains('show') || 
        erroCpf.classList.contains('show') || 
        erroData.classList.contains('show') || 
        erroSenha.classList.contains('show')) {
        temErro = true;
    }

    return !temErro;
}

function mostrarErroGeral(mensagem) {
    divErro.textContent = mensagem;
    divErro.classList.add('show');
    divSucesso.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

formulario.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validarCamposSubmit()) {
        return;
    }

    const botao = document.querySelector('button[type="submit"]');
    botao.disabled = true;
    botao.textContent = '⏳ Cadastrando...';

    try {
        const formData = new FormData();
        formData.append('nome', inputNome.value.trim());
        formData.append('email', inputEmail.value.trim());
        formData.append('cpf', inputCpf.value);
        formData.append('data_nascimento', inputData.value);
        formData.append('senha', inputSenha.value);
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
            mostrarErroGeral(' Erro: ' + (dados.mensagem || 'Erro ao cadastrar administrador'));
        }
    } catch (erro) {
        mostrarErroGeral(' Erro de conexão: ' + erro.message);
    } finally {
        botao.disabled = false;
        botao.textContent = '💾 Criar Administrador';
    }
});

// ==========================================
// 5. FUNÇÕES DISPONÍVEIS GLOBALMENTE (Botões HTML)
// ==========================================

// Expomos a função globalmente (window.) para que o onclick="limparFormulario()" do botão consiga acessá-la.
window.limparFormulario = function() {
    formulario.reset();
    
    // Garante remoção rigorosa de TODOS os erros visuais
    erroNome.classList.remove('show');
    erroEmail.classList.remove('show');
    erroCpf.classList.remove('show');
    erroData.classList.remove('show');
    erroSenha.classList.remove('show');
    
    divErro.classList.remove('show');
    divSucesso.classList.remove('show');
};

window.voltarPerfis = function() {
    window.location.href = '../home/lista_administrador.html';
};