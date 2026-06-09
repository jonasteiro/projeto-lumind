# 📖 Guia de Implementação: Novo Campo Decimal (FLOAT) em Administrador

Este guia documenta o ciclo de vida completo para a inserção de um novo atributo numérico com casas decimais (`FLOAT`) na entidade **Administrador**. Utilizaremos a adição do campo **`salario`** como exemplo prático.

O fluxo de dados segue a arquitetura: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Campos que exigem precisão decimal (como dinheiro, peso ou porcentagem) utilizam o tipo `FLOAT` ou `DECIMAL`.

**Onde posicionar:** Execute este comando diretamente no seu SGBD (ex: phpMyAdmin).

```sql
-- Adiciona a coluna com um valor padrão de 0.00 para evitar erros em contas matemáticas no futuro
ALTER TABLE Administrador 
ADD COLUMN salario FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML)

Precisamos adicionar o campo no formulário onde o administrador é cadastrado ou editado. O segredo para decimais no HTML é o atributo `step="0.01"`.

**Onde posicionar:** No arquivo de cadastro de admin (ex: `cadastro_admin.html`), dentro da tag `<form>`.

```html
<div class="mb-3">
    <div class="form-floating">
        <input type="number" step="0.01" min="0" class="form-control rounded-3 border-light-subtle" id="salario" name="salario" placeholder="Ex: 3500.50">
        <label for="salario" class="text-muted"><i class="bi bi-currency-dollar me-2"></i>Salário Base (R$)</label>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

Se você estiver usando o `formData.append` manual no JavaScript (como fizemos no profissional), capture o valor numérico. *(Nota: Se estiver usando `new FormData(form)`, este passo é automático).*

**Onde posicionar:** No arquivo JS de criação (ex: `admin_novo.js`), antes do `fetch()`.

```javascript
// 1. Captura o valor diretamente do input
const salarioAdmin = document.getElementById('salario').value;

// 2. Anexa ao pacote de envio
const formData = new FormData();
// ... (outros campos do form)
formData.append('salario', salarioAdmin);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

O backend recebe o dado e obriga a variável a se tornar um `float` no PHP. No `bind_param` do MySQL, decimais usam a letra **`d`** (Double).

**Onde posicionar:** No arquivo PHP que insere o usuário no banco (ex: `usuario_novo.php`).

```php
// 1. Captura e converte para float (se vier vazio, assume 0.00)
$salario = !empty($_POST['salario']) ? (float) $_POST['salario'] : 0.00;

// ... [código que salva a tabela base Usuario] ...

if ($tipo_usuario === 'Administrador') {
    
    // 2. Atualiza a query do Administrador (adicionando a nova coluna)
    $stmt_adm = $conexao->prepare("INSERT INTO Administrador (id_usuario, status_adm, cargo_administrativo, salario) VALUES (?, TRUE, ?, ?)");
    
    // 3. Atualiza o bind_param! 
    // i = id_usuario (Inteiro)
    // s = cargo_administrativo (String)
    // d = salario (Double/Float) -> NOVO
    // Resultado: "isd"
    $stmt_adm->bind_param("isd", $id_usuario, $cargo_administrativo, $salario);
    
    $stmt_adm->execute(); 
    $stmt_adm->close();
}
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Para visualizar esse salário em uma tabela de listagem futura, o PHP precisa buscá-lo.

**Onde posicionar:** No arquivo PHP que lista os administradores (ex: `listar_admin.php`).

```sql
-- Adicione A.salario na lista do SELECT
SELECT 
    U.id_usuario, 
    U.nome, 
    U.email, 
    A.cargo_administrativo, 
    A.salario -- NOVO CAMPO ADICIONADO AQUI
FROM Usuario U
INNER JOIN Administrador A ON U.id_usuario = A.id_usuario
WHERE U.tipo_usuario = 'Administrador'
```

---

## 🖥️ Passo 6: Exibindo Formatado na Tela (JavaScript)

Ao injetar o valor no HTML, é ideal formatá-lo como moeda brasileira (R$).

**Onde posicionar:** No arquivo JS que preenche a tabela (ex: `listar_admin.js`), no momento de montar as linhas (`<tr>`).

```javascript
// Dentro do forEach que monta a tabela...

// 1. Converte a string que veio do banco para Float garantido
const valorFloat = parseFloat(adm.salario || 0);

// 2. Formata para o padrão R$ 0,00 (duas casas decimais e vírgula)
const salarioFormatado = `R$ ${valorFloat.toFixed(2).replace('.', ',')}`;

// 3. Injeta na montagem do HTML
html += `
    <tr>
        <td class="fw-bold">${admin.nome}</td>
        <td class="text-muted">${admin.cargo_administrativo || '--'}</td>
        <td class="text-success fw-semibold">${salarioFormatado}</td> <td>
            </td>
    </tr>
`;
```