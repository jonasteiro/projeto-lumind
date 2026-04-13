# Implementação e Validação do Campo "Cidade"

Esta documentação compila a implementação Full-Stack do campo **Cidade** para o cadastro de usuários. O código cobre desde a modelagem estrutural no banco até a higienização de dados no servidor.

---

## 1. Banco de Dados (SQL)

Criação da tabela bloqueando valores nulos para manter a integridade dos dados.

```sql
CREATE TABLE Usuario (
    id_usuario       INT          NOT NULL AUTO_INCREMENT,
    nome             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    senha            VARCHAR(255) NOT NULL,
    cpf              CHAR(11)     NOT NULL UNIQUE,
    data_nascimento  DATE         NOT NULL,
    cidade           VARCHAR(100) NOT NULL,
    tipo_usuario     VARCHAR(20)  NOT NULL,
    PRIMARY KEY (id_usuario)
);
```

---

## 2. Frontend (HTML)

Estrutura semântica do formulário já com travas nativas do navegador.

```html

<p id="erroHeitor"></p>


<div class="form-group">
    <label for="email">Email *</label>
    <input 
        type="email" 
        id="email" 
        name="email" 
        placeholder="exemplo@email.com" 
        required
        maxlength="100"
    >
    <p id="erro" class="form-error"></p>
</div>
```

---

## 3. Motor de Validação (JavaScript)

Bloqueia o envio e alerta o usuário sobre regras de preenchimento em tempo de execução.

```javascript
const nomeDigitado = document.getElementById('nome').value.trim();
document.getElementById('erroNome').textContent = nomeDigitado;
document.getElementById('erroNome').classList.add('show');


const nome = document.getElementById('nome').value.trim();

        if (dados.status === 'sucesso') {
            alert(nome + " cadastrado/a com sucesso!!");
            mostrarSucesso(' Administrador cadastrado com sucesso! Redirecionando...');
        } else {
            mostrarErro(' Erro: ' + (dados.mensagem || 'Erro ao cadastrar administrador'));
        }


        


// Validação de email (Estritamente sem Regex, conforme exigido)
function validarEmail(email) {
    // Verifica se existe o caractere "@" na string
    const temArroba = email.includes('@');
    
    // Dispara a validação no Console do DevTools
    if (!temArroba) {
        console.error("Validação falhou: O e-mail não contém o caractere '@'.");
        return false;
    }
    
    console.log("Validação aprovada: O e-mail possui '@'.");
    return true;
}

// Limpar mensagens de erro anteriores
    document.getElementById('erroNome').classList.remove('show');
    document.getElementById('erro').classList.remove('show'); // ID corrigido
    document.getElementById('erroCpf').classList.remove('show');

    // Validar email
    if (!validarEmail(email)) {
        // Usa o parágrafo exato exigido e o texto exato
        document.getElementById('erro').textContent = 'Erro na validação do E-Mail';
        document.getElementById('erro').classList.add('show');
        temErro = true;
    }

    document.getElementById('email').addEventListener('input', function() {
    if (validarEmail(this.value)) {
        document.getElementById('erro').classList.remove('show'); // ID corrigido
    }
    });





function validarEmailLogico(email) {
    // 1. O e-mail não pode estar vazio
    if (!email || email.trim() === '') {
        console.error("Erro: E-mail em branco.");
        return false;
    }

    // 2. Divide a string usando o '@' como faca
    const partes = email.split('@');

    // Se o array resultante não tiver exatamente 2 posições, 
    // significa que não tem '@' ou tem mais de um (ex: a@b@c.com)
    if (partes.length !== 2) {
        console.error("Erro: Formato inválido. O e-mail deve conter exatamente um '@'.");
        return false;
    }

    const usuario = partes[0];
    const dominio = partes[1];

    // 3. Verifica se tem algo escrito ANTES do '@'
    if (usuario.length === 0) {
        console.error("Erro: Nome de usuário ausente antes do '@'.");
        return false;
    }

    // 4. Verifica se tem algo DEPOIS do '@' e se possui um ponto ('.')
    if (dominio.length < 3 || !dominio.includes('.')) {
        console.error("Erro: Domínio inválido. Deve conter pelo menos um ponto (ex: .com).");
        return false;
    }

    // 5. Verifica se o ponto não é o primeiro nem o último caractere do domínio
    if (dominio.startsWith('.') || dominio.endsWith('.')) {
        console.error("Erro: O domínio não pode começar ou terminar com um ponto.");
        return false;
    }

    /* ========================================================
    A SUA PERGUNTA SOBRE VERIFICAR "TIPO GMAIL" ENTRA AQUI:
    ========================================================
    */
    // if (!dominio.toLowerCase().includes('gmail.com')) {
    //     console.error("Erro: Apenas e-mails do Gmail são aceitos neste sistema.");
    //     return false;
    // }

    console.log("Sucesso: E-mail estruturalmente válido.");
    return true;
}
```

---

## 4. Processamento Seguro (PHP)

Sanitização de ponta a ponta e preparação da query no motor de banco.

```php
<?php
// Higienização contra XSS
$nome            = htmlspecialchars($_POST['nome']            ?? '', ENT_QUOTES, 'UTF-8');
$email           = htmlspecialchars($_POST['email']           ?? '', ENT_QUOTES, 'UTF-8');
$cpf             = htmlspecialchars($_POST['cpf']             ?? '', ENT_QUOTES, 'UTF-8');
$senha           = $_POST['senha']           ?? '';
$data_nascimento = $_POST['data_nascimento'] ?? '';
$cidade          = htmlspecialchars($_POST['cidade']          ?? '', ENT_QUOTES, 'UTF-8');
$tipo_usuario    = $_POST['tipo_usuario']    ?? '';

// Construção da query parametrizada
$stmt = $conexao->prepare(
    "INSERT INTO Usuario (nome, email, senha, cpf, data_nascimento, cidade, tipo_usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);

// Preenchimento dos parâmetros
$stmt->bind_param("sssssss", $nome, $email, $senha, $cpf, $data_nascimento, $cidade, $tipo_usuario);

// Execução
$stmt->execute();
?>
```