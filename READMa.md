# Implementação e Validação do Campo "Cidade"

Esta documentação detalha a implementação completa (Full-Stack) do campo **Cidade** no formulário de cadastro de usuários, cobrindo desde o esquema do banco de dados até o processamento no backend.

## 1. Banco de Dados (SQL)
O campo `cidade` deve ser adicionado à tabela `Usuario` com limite de 100 caracteres e bloqueio para valores nulos.

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


2. Interface do Usuário (HTML)
O campo de entrada deve ser alocado dentro de uma classe form-group, possuir validação nativa do navegador (required, maxlength) e conter um contêiner span para o retorno de erros assíncronos.

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


3. Validação no Cliente (JavaScript)
A lógica no frontend impede submissões com dados inválidos (menos de 3 caracteres) e manipula o DOM para exibir mensagens dinâmicas.

JavaScript
// Captura dos dados do formulário
const nome = document.getElementById('nome').value.trim();
const email = document.getElementById('email').value.trim();
const cpf = document.getElementById('cpf').value.trim();
const dataNascimento = document.getElementById('data_nascimento').value;
const cidade = document.getElementById('cidade').value.trim();
const senha = document.getElementById('senha').value;

function validarCampos() {
    let temErro = false;

    // Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroCidade').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');

    // Validar regras da cidade
    if (cidade.length < 3) {
        document.getElementById('erroCidade').textContent = 'Cidade deve ter pelo menos 3 caracteres';
        document.getElementById('erroCidade').classList.add('show');
        temErro = true;
    }
    
    return !temErro;
}

// Limpar formulário globalmente
function limparFormulario() {
    formulario.reset();
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erroEmail').classList.remove('show');
    document.getElementById('erroCpf').classList.remove('show');
    document.getElementById('erroData').classList.remove('show');
    document.getElementById('erroCidade').classList.remove('show');
    document.getElementById('erroSenha').classList.remove('show');
}

// Listener para limpar o erro em tempo real durante a correção da digitação
document.getElementById('cidade').addEventListener('input', function() {
    if (this.value.length >= 3) {
        document.getElementById('erroCidade').classList.remove('show');
    }
});


4. Processamento no Servidor (PHP)
O backend recebe a requisição, sanitiza contra ataques XSS e executa a inserção com Prepared Statements para evitar SQL Injection.

PHP
<?php
// Sanitização de segurança das entradas
$nome            = htmlspecialchars($_POST['nome'] ?? '', ENT_QUOTES, 'UTF-8');
$email           = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
$cpf             = htmlspecialchars($_POST['cpf'] ?? '', ENT_QUOTES, 'UTF-8');
$senha           = $_POST['senha'] ?? '';
$data_nascimento = $_POST['data_nascimento'] ?? '';
$cidade          = htmlspecialchars($_POST['cidade'] ?? '', ENT_QUOTES, 'UTF-8');
$tipo_usuario    = $_POST['tipo_usuario'] ?? '';

// Preparação e execução da Query
$stmt = $conexao->prepare("INSERT INTO Usuario (nome, email, senha, cpf, data_nascimento, cidade, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)");

// Vinculação de parâmetros (7 strings)
$stmt->bind_param("sssssss", $nome, $email, $senha, $cpf, $data_nascimento, $cidade, $tipo_usuario);

// Execução segura
$stmt->execute();
?>