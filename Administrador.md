# 📖 Guia de Implementação: Super Combo (5 Campos) em Administrador

Este guia documenta a inserção simultânea de cinco novos campos na entidade **Administrador**, passando pelo banco de dados, formulário de cadastro, salvamento no PHP e exibição segura na listagem de administradores.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

**Onde posicionar:** Execute este comando diretamente no seu SGBD (ex: phpMyAdmin).

```sql
ALTER TABLE Administrador
ADD COLUMN departamento VARCHAR(100) NULL,
ADD COLUMN observacoes_internas TEXT NULL,
ADD COLUMN data_contratacao DATE NULL,
ADD COLUMN nivel_acesso INT NULL DEFAULT 1,
ADD COLUMN salario_base FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML)

Adicione os novos inputs no formulário de criação de um novo Administrador.

**Onde posicionar:** No arquivo `cadastro_admin.html`, dentro do seu `<form>` principal.

```html
<h5 class="mt-4 mb-3 text-primary border-bottom pb-2">Informações Corporativas</h5>
<div class="row g-3 mb-4">
    <div class="col-md-6">
        <div class="form-floating">
            <input type="text" class="form-control" id="departamento" name="departamento" placeholder="Ex: Financeiro" maxlength="100">
            <label for="departamento"><i class="bi bi-building me-2"></i> Departamento</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="1" min="1" max="5" class="form-control" id="nivel_acesso" name="nivel_acesso" placeholder="1 a 5">
            <label for="nivel_acesso"><i class="bi bi-shield-lock me-2"></i> Nível de Acesso (1 a 5)</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="date" class="form-control" id="data_contratacao" name="data_contratacao">
            <label for="data_contratacao"><i class="bi bi-calendar-check me-2"></i> Data de Contratação</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="0.01" min="0" class="form-control" id="salario_base" name="salario_base" placeholder="Ex: 4500.50">
            <label for="salario_base"><i class="bi bi-currency-dollar me-2"></i> Salário Base (R$)</label>
        </div>
    </div>

    <div class="col-12">
        <div class="form-floating">
            <textarea class="form-control" id="observacoes_internas" name="observacoes_internas" style="height: 100px;" placeholder="Anotações internas..."></textarea>
            <label for="observacoes_internas"><i class="bi bi-journal-text me-2"></i> Observações Internas</label>
        </div>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

*(Lembrete: Se o seu arquivo JS de cadastro (`admin_novo.js`) usa `new FormData(form)`, este passo é automático e o JS vai puxar as tags `name="..."` sozinho. Caso você faça manual, adicione as linhas abaixo).*

```javascript
formData.append('departamento', document.getElementById('departamento').value.trim());
formData.append('observacoes_internas', document.getElementById('observacoes_internas').value.trim());
formData.append('data_contratacao', document.getElementById('data_contratacao').value);
formData.append('nivel_acesso', document.getElementById('nivel_acesso').value);
formData.append('salario_base', document.getElementById('salario_base').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Protegemos os textos, tratamos a data e forçamos os números para os tipos corretos, convertendo a vírgula para ponto no FLOAT.

**Onde posicionar:** No arquivo `usuario_novo.php` (ou similar que cadastra o Admin).

**Parte A: Captura e Tratamento**
```php
$departamento = htmlspecialchars($_POST['departamento'] ?? '', ENT_QUOTES, 'UTF-8');
$observacoes_internas = htmlspecialchars($_POST['observacoes_internas'] ?? '', ENT_QUOTES, 'UTF-8');
$data_contratacao = !empty($_POST['data_contratacao']) ? $_POST['data_contratacao'] : null;
$nivel_acesso = !empty($_POST['nivel_acesso']) ? (int) $_POST['nivel_acesso'] : 1;

// Trata a vírgula do FLOAT
$salario_bruto = !empty($_POST['salario_base']) ? $_POST['salario_base'] : '0';
$salario_base = (float) str_replace(',', '.', $salario_bruto);
```

**Parte B: Atualizando o INSERT do Administrador**
```php
// Localize o bloco `if ($tipo_usuario === 'Administrador') {`
$stmt_adm = $conexao->prepare("
    INSERT INTO Administrador (
        id_usuario, status_adm, cargo_administrativo, 
        departamento, observacoes_internas, data_contratacao, nivel_acesso, salario_base
    ) VALUES (?, TRUE, ?, ?, ?, ?, ?, ?)
");

// Bind Param Original: "is" (id, cargo)
// Novos tipos: s(depto), s(obs), s(data), i(nivel), d(salario)
// Resultado: "isssssid"
$stmt_adm->bind_param("isssssid", 
    $id_usuario, 
    $cargo_administrativo, 
    $departamento, 
    $observacoes_internas, 
    $data_contratacao, 
    $nivel_acesso, 
    $salario_base
);

$stmt_adm->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Atualize o SELECT para que a listagem consiga enxergar os campos.

**Onde posicionar:** No arquivo `administrador_get.php`.

```sql
SELECT 
    U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
    A.status_adm, A.cargo_administrativo, 
    A.departamento, A.observacoes_internas, A.data_contratacao, A.nivel_acesso, A.salario_base
FROM Usuario U
INNER JOIN Administrador A ON U.id_usuario = A.id_usuario
WHERE U.tipo_usuario = 'Administrador'
ORDER BY U.nome ASC
```

---

## 🖥️ Passo 6: Exibindo na Tela (JavaScript da Tabela)

Vamos enriquecer a tabela (`listar_admin.html`) injetando as novas informações blindadas contra dados vazios.

**Onde posicionar:** No arquivo `listar_admin.js`, dentro da sua função `preencherTabela(dados, tbody)`.

```javascript
dados.forEach(adm => {
    // Tratamento de Status Existente
    const isAtivo = (adm.status_adm == 1 || adm.status_adm === "1" || adm.status_adm === true);
    const statusClass = isAtivo ? "bg-success" : "bg-danger";
    const statusTexto = isAtivo ? "Ativo" : "Inativo";

    // 1. FLOAT (Salário)
    const valorFloat = parseFloat(adm.salario_base || 0);
    const salarioFormatado = `R$ ${valorFloat.toFixed(2).replace('.', ',')}`;

    // 2. DATE (Data de Contratação)
    const dataContratacaoFormatada = adm.data_contratacao 
        ? new Date(adm.data_contratacao + 'T00:00:00').toLocaleDateString('pt-BR') 
        : '--';

    // 3. INT (Nível de Acesso)
    const nivelBadge = adm.nivel_acesso 
        ? `<span class="badge bg-secondary">Nv. ${adm.nivel_acesso}</span>` 
        : '--';

    // 4 e 5. VARCHAR e TEXT
    const depto = adm.departamento || '--';
    // Se quiser exibir observações, pode usar a função sanitizarHTML e jogar num botão de Modal ou tooltip!

    // Montando as linhas da tabela (html += `...`)
    html += `
        <tr>
            <td class="ps-3 fw-medium text-dark">
                ${adm.nome} <br>
                <small class="text-muted">${adm.email}</small>
            </td>
            <td class="text-muted">
                <strong>${adm.cargo_administrativo || 'Admin'}</strong><br>
                <small>${depto}</small>
            </td>
            <td class="text-center">${nivelBadge}</td>
            <td class="text-muted">${dataContratacaoFormatada}</td>
            <td class="text-success fw-semibold">${salarioFormatado}</td> 
            <td class="text-center">
                <span class="badge ${statusClass} rounded-pill px-3 py-2">${statusTexto}</span>
            </td>
            <td class="text-end pe-3">
                <div class="btn-group">
                    <a href="alterar_admin.html?id=${adm.id_usuario}" class="btn btn-sm btn-outline-primary rounded-pill me-1" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <button onclick="excluir(${adm.id_usuario})" class="btn btn-sm btn-outline-danger rounded-pill" title="Excluir">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </td>
        </tr>`;
});
```

*(Lembre-se de adicionar as colunas `<th>Departamento</th>`, `<th>Acesso</th>`, `<th>Contratação</th>` no seu arquivo `listar_admin.html` para bater certinho com os `<tds>` novos gerados pelo JS!)*
