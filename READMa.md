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


##5. TESTE AUTORIA -

```
  // TESTE (YASMIN)
    // INSTAGRAM: HTML
    //ADCIONANDO NOVO CAMPO TEXT NO HTML, QUE IRÁ VALIDAR SE TEM "@" E NO MINÍMO 2 CARACTERES
  
                <div class="form-group">
                    <label for="instagram">Instagram</label>
                    <input 
                        type="text" 
                        id="instagram" 
                        name="instagram" 
                        placeholder="@seu_usuario" 
                        maxlength="30"
                    >
                    <span class="form-error" id="erroInstagram"></span>
                    <small class="form-hint">Mínimo 2 caracteres</small>
                </div>


   // INSTAGRAM: JAVASCRIPT
   // Em validar campos adione o código para fazer a validação do instagram
    const instagram = document.getElementById('instagram').value.trim();

   //  EM Limpar mensagens de erro anteriores adcione um para limpar erro do instagram
     document.getElementById('erroInstagram').classList.remove('show');

   // VALIDAÇÃO INSTAGRAM NO JAVASCRIPT (PLUS: ADCIONEI UM ALERT)
    if (!instagram.startsWith('@') || instagram.length < 2) {
        document.getElementById('erroInstagram').textContent = 'Instagram deve começar com @ e ter pelo menos 2 caracteres';
        document.getElementById('erroInstagram').classList.add('show');
        temErro = true;
    }else{ 
        alert("Instagram válido!");
    }


    // TESTE (YASMIN)
    // RG: HTML
    //ADCIONANDO NOVO CAMPO TEXT NO HTML
   <div class ="form-group">
                    <label for="rg">RG *</label>
                    <input type="text" id="rg" placeholder="Digite seu RG">
                    <p class="form-error" id="erroRg"></p>  
                </div>

    // RG:JAVASCRIPT  SEM CRIAR FUNÇÃO
    //INSERINDO AS VARIAVEIS DO CAMPO E DO ERRO NA FUNÇÃO VALIDARCAMPO
    const rg = document.getElementById('rg').value.trim();
    const erroRg = document.getElementById('erroRg');


        if (typeof rg !== "string") return false;

    // Remove caracteres não numéricos manualmente
    let somenteNumeros = "";
    for (let i = 0; i < rg.length; i++) {
        const char = rg[i];
        if (char >= "0" && char <= "9") {
            somenteNumeros += char; // acumula apenas os dígitos
        }
    }

    // Agora você pode sobrescrever rg com apenas os números
    rg = somenteNumeros;

    // validar se contém apenas números:
     if (!/^\d{7,9}$/.test(rg)) {
    mostrarErro('erroRg', 'RG deve ter entre 7 e 9 dígitos numéricos');
    temErro = true;
    }


    // VALIDAR SE RG TEM DE 7 A 9 CARACTERES
     if (rg.length < 7 || rg.length > 9) {
        erroRg.textContent = 'RG deve ter entre 7 e 9 dígitos';
        erroRg.classList.add('show');
        temErro = true;
    }else {
        alert("RG válido!"); 
    }

    // ALTERNATIVA PARA ELSE exibe mensagem de sucesso sem comando alert
    else {
    document.getElementById('erroRg').textContent = 'RG válido!';
    document.getElementById('erroRg').classList.add('show');
    }


// TESTE YASMIN (PLUS): Validação de senha mais completa  ( letras maiúsculas, minúsculas e números)
  if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}/.test(senha)) {
    mostrarErro('erroSenha', 'Senha deve ter ao menos 6 caracteres, incluindo maiúscula, minúscula e número');
    temErro = true;
}




//TESTE GABY
//*Validaçao Cracha Numero*
//No Cadastro Admin HTML adicione o campo *Cracha* ele e validaçao de numero menor de 10 da erro
//Antes das linhas e depois que o </div> que fecha o bloco
//<div id="divErro" class="alert alert-error"></div>
//<div id="divSucesso" class="alert alert-success"></div> colocar o html

<!-- Cracha Teste -->
<!------------------>
        <div class="form-group">
            <label for="cracha">Número do Crachá *</label>
            <input type="text" id="cracha" name="cracha" placeholder="Ex: ADM-2024-001" required maxlength="10">
            <span class="form-error" id="erroCracha"></span>
            <small class="form-hint">Mínimo 10 caracteres</small>
        </div>
                
<!------------------>
<!-- Cracha Teste -->

//Agora no JS 
// Validar campos individualmente
//adiciona o seguinte em baixo de as linhas de
//function validarCampos() {
//teste cracha
    const cracha = document.getElementById('cracha').value.trim();
//teste cracha

//logo depois em 
// Limpar mensagens de erro anteriores onde ficam os document.getElementById('erroNome').classList.remove('show');
//adiciona o meu
    //teste cracha
    document.getElementById('erroCracha').classList.remove('show');
    //teste cracha//

//logo depois nos ifs de validaçao se adiciona o nosso if
//teste cracha
    // Validar crachá
    if (cracha.length < 10) {
        document.getElementById('erroCracha').textContent = 'Crachá inválido, mínimo 10 caracteres';
        document.getElementById('erroCracha').classList.add('show');
        temErro = true;
    } else {
        alert('Crachá informado: ' + cracha);
    }
    //teste cracha
//so isso para a validaçao de cracha



//*Validação Site URL*
//No Cadastro Profissional HTML adicione o campo *Site* ele é validação de URL sem http:// ou https:// da erro
//Antes das linhas e depois que o </div> que fecha o bloco senha
//<div class="p-3 bg-light rounded-4 mb-4 border"> colocar o html

<!-- Site Teste -->
<!------------------>
        <div class="col-12">
            <label class="form-label small fw-bold text-muted">Site *</label>
            <input type="text" id="site" name="site" class="form-control rounded-3" placeholder="Ex: https://www.instituto.com.br" required maxlength="200">
            <span class="msg-erro" id="erroSite"></span>
            <small class="form-hint">Deve começar com http:// ou https://</small>
        </div>
<!------------------>
<!-- Site Teste -->

//Agora no JS
// Validar campos individualmente
//adiciona o seguinte em baixo das linhas de
//function validarCampos() {
//teste site
    const site = document.getElementById('site').value.trim();
//teste site

//logo depois em
// Limpar mensagens de erro anteriores onde ficam os document.getElementById('erroNome').classList.remove('show');
//adiciona o meu
    //teste site
    document.getElementById('erroSite').classList.remove('show');
    //teste site

//logo depois nos ifs de validação se adiciona o nosso if
//teste site
    // Validar site
    if (!site.startsWith('http://') && !site.startsWith('https://')) {
        document.getElementById('erroSite').textContent = 'Site inválido, deve começar com http:// ou https://';
        document.getElementById('erroSite').classList.add('show');
        temErro = true;
    } else {
        alert('Site informado: ' + site);
    }
    //teste site
//so isso para a validação de site

```


