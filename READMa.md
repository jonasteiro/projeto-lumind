# Implementação e Validação do Campo "Cidade"

Esta documentação compila a implementação Full-Stack do campo **Cidade** para o cadastro de usuários. O código cobre desde a modelagem estrutural no banco até a higienização de dados no servidor.

## 1. Banco de Dados (SQL)
Criação da tabela bloqueando valores nulos para manter a integridade dos dados.

```sql
CREATE TABLE Usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_usuario)
);

## 2. Frontend (HTML)
Estrutura semântica do formulário já com travas nativas do navegador.

HTML
<div class="form-group">
    <label for="cidade">Cidade *</label>
    <input 
        type="text" 
        id="cidade" 
        name="cidade" 
        placeholder="Digite o nome da cidade" 
        required 
        maxlength="100"
    >
    <span class="form-error" id="erroCidade"></span>
</div>

## 3. Motor de Validação (JavaScript)
Bloqueia o envio e alerta o usuário sobre regras de preenchimento em tempo de execução.

JavaScript
// Captura dos dados
const nome = document.getElementById('nome').value.trim();
const email = document.getElementById('email').value.trim();
const cpf = document.getElementById('cpf').value.trim();
const dataNascimento = document.getElementById('data_nascimento').value;
const cidade = document.getElementById('cidade').value.trim();
const senha = document.getElementById('senha').value;

function validarCampos() {
    let temErro = false;

    // Reseta o estado visual dos erros
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroCidade').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');

    // Regra de negócio: mínimo de 3 caracteres
    if (cidade.length < 3) {
        document.getElementById('erroCidade').textContent = 'Cidade deve ter pelo menos 3 caracteres';
        document.getElementById('erroCidade').classList.add('show');
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
        const formData = new FormData(); 
        
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('cidade', document.getElementById('cidade').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value);
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('senha', document.getElementById('senha').value);
        
        formData.append('tipo_usuario', 'Administrador'); 

function limparFormulario() {
    formulario.reset();
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroCidade').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');
}

// Limpeza dinâmica do alerta ao digitar
document.getElementById('cidade').addEventListener('input', function() {
    if (this.value.length >= 3) {
        document.getElementById('erroCidade').classList.remove('show');
    }
});


## 4. Processamento Seguro (PHP)
Sanitização de ponta a ponta e preparação da query no motor de banco.

PHP
<?php
// Higienização contra XSS
$nome            = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
$email           = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
$cpf             = htmlspecialchars($_POST['cpf'] ?? '', ENT_QUOTES, 'UTF-8');
$senha           = $_POST['senha'] ?? '';
$data_nascimento = $_POST['data_nascimento'] ?? '';
$cidade          = htmlspecialchars($_POST['cidade'] ?? '', ENT_QUOTES, 'UTF-8');
$tipo_usuario    = $_POST['tipo_usuario'] ?? '';

// Construção da Query Parametrizada
$stmt = $conexao->prepare("INSERT INTO Usuario (nome, email, senha, cpf, data_nascimento, cidade, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)");

// Preenchimento de Parâmetros
$stmt->bind_param("sssssss", $nome, $email, $senha, $cpf, $data_nascimento, $cidade, $tipo_usuario);

// Execução
$stmt->execute();
?>