# 🧠 GUIA DE AUTORIA — ADICIONAR NOVO CAMPO (PROJETO LUMIND)
> **Use em qualquer CRUD do projeto. Fluxo obrigatório: SQL → HTML → JS → PHP**

---

## 📂 MAPA DO PROJETO (leia antes de qualquer coisa)

```
projeto-lumind/
├── lumind_db.sql                        ← Banco de dados (ALTER TABLE aqui)
├── php/
│   ├── conexao.php                      ← Configuração do banco (não mexa)
│   ├── usuario_novo.php                 ← PHP de CADASTRO (profissional, responsável, paciente, admin)
│   ├── usuario_excluir.php              ← PHP de EXCLUSÃO (compartilhado)
│   ├── profissional/
│   │   ├── listar-profissionais.php     ← PHP de LISTAGEM/BUSCA do profissional
│   │   └── alterar_profissional.php     ← PHP de ATUALIZAÇÃO do profissional
│   ├── responsavel/
│   │   ├── responsavel_get.php          ← PHP de LISTAGEM/BUSCA do responsável
│   │   ├── responsavel_alterar.php      ← PHP de ATUALIZAÇÃO do responsável
│   │   └── relatorio_salvar.php         ← PHP de SALVAR relatório
│   ├── pessoa_tea/
│   │   ├── pessoa_tea_get.php           ← PHP de LISTAGEM/BUSCA da pessoa TEA
│   │   └── pessoa_tea_alterar.php       ← PHP de ATUALIZAÇÃO da pessoa TEA
│   └── admin/
│       ├── administrador_get.php        ← PHP de LISTAGEM/BUSCA do admin
│       └── administrador_alterar.php    ← PHP de ATUALIZAÇÃO do admin
├── home/
│   ├── cadastro_profissional.html       ← Formulário de cadastro (profissional)
│   ├── profissional/alterar_profissional.html ← Formulário de edição
│   ├── profissional/listar-profissionais.html ← Tela de listagem
│   └── (mesma lógica para responsavel, pessoa_tea, admin...)
└── js/
    ├── profissional/profissional_novo.js     ← JS do formulário de cadastro
    ├── profissional/alterar_profissional.js  ← JS do formulário de edição
    ├── profissional/listar-profissionais.js  ← JS da tela de listagem
    └── (mesma lógica para responsavel, pessoa_tea, admin...)
```

---

## 🗺️ QUAL TABELA PERTENCE A QUAL CRUD?

| CRUD             | Tabela principal      | Tabela base   | PHP novo/cadastro      |
|------------------|-----------------------|---------------|------------------------|
| Profissional     | `ProfissionalSaude`   | `Usuario`     | `usuario_novo.php`     |
| Responsável      | `ResponsavelLegal`    | `Usuario`     | `usuario_novo.php`     |
| Pessoa TEA       | `PessoaTea`           | `Usuario`     | `usuario_novo.php`     |
| Administrador    | `Administrador`       | `Usuario`     | `usuario_novo.php`     |
| Relatório        | `Relatorio`           | —             | `relatorio_salvar.php` |

---

## 🔤 TIPOS DE CAMPO — REFERÊNCIA RÁPIDA

| Tipo pedido      | MySQL                  | HTML input              | PHP bind_param |
|------------------|------------------------|-------------------------|----------------|
| texto / varchar  | `VARCHAR(100)`         | `type="text"`           | `s`            |
| texto longo      | `TEXT`                 | `<textarea>`            | `s`            |
| data (date)      | `DATE`                 | `type="date"`           | `s`            |
| inteiro (int)    | `INT`                  | `type="number"`         | `i`            |
| decimal (float)  | `FLOAT` ou `DECIMAL`   | `type="number" step="any"` | `d`         |
| duplo (double)   | `DOUBLE`               | `type="number" step="any"` | `d`         |

---

## ✅ PASSO A PASSO COMPLETO (10 MINUTOS)

---

### ⚡ PASSO 1 — BANCO DE DADOS (`lumind_db.sql`)

Execute no MySQL/phpMyAdmin. Substitua `NOME_TABELA` e `nome_campo`:

```sql
-- EXEMPLO GENÉRICO (copie e adapte):
ALTER TABLE NOME_TABELA ADD COLUMN nome_campo TIPO_CAMPO NULL;

-- EXEMPLOS POR TIPO:
ALTER TABLE ProfissionalSaude ADD COLUMN data_formacao DATE NULL;
ALTER TABLE ProfissionalSaude ADD COLUMN anos_experiencia INT NULL;
ALTER TABLE ProfissionalSaude ADD COLUMN nota_avaliacao FLOAT NULL;
ALTER TABLE Relatorio         ADD COLUMN humor_paciente VARCHAR(50) NULL;
ALTER TABLE PessoaTea         ADD COLUMN peso_kg DOUBLE NULL;
```

> **⚠️ ATENÇÃO:** Se o campo for obrigatório na tabela, use `NOT NULL` e defina um `DEFAULT`.
> Para testes rápidos, sempre use `NULL` para não quebrar dados existentes.

---

### ⚡ PASSO 2 — HTML (formulário de cadastro e/ou edição)

Encontre o formulário (`<form id="...">`) e adicione o campo antes do fechamento `</form>`:

```html
<!-- Cole dentro do <form>, antes do fechamento </form> -->

<!-- CAMPO TEXTO (varchar / text) -->
<div class="mb-3">
    <div class="form-floating">
        <input type="text" class="form-control rounded-3 border-light-subtle"
               id="nome_campo" placeholder="...">
        <label for="nome_campo" class="text-muted">
            <i class="bi bi-pencil me-2"></i>Rótulo do Campo
        </label>
    </div>
    <span class="text-danger small" id="erroNomeCampo"></span>
</div>

<!-- CAMPO DATA (date) -->
<div class="mb-3">
    <div class="form-floating">
        <input type="date" class="form-control rounded-3 border-light-subtle"
               id="nome_campo">
        <label for="nome_campo" class="text-muted">
            <i class="bi bi-calendar-event me-2"></i>Rótulo do Campo
        </label>
    </div>
    <span class="text-danger small" id="erroNomeCampo"></span>
</div>

<!-- CAMPO INTEIRO (int) -->
<div class="mb-3">
    <div class="form-floating">
        <input type="number" class="form-control rounded-3 border-light-subtle"
               id="nome_campo" placeholder="0">
        <label for="nome_campo" class="text-muted">
            <i class="bi bi-hash me-2"></i>Rótulo do Campo
        </label>
    </div>
    <span class="text-danger small" id="erroNomeCampo"></span>
</div>

<!-- CAMPO FLOAT / DOUBLE (decimais) -->
<div class="mb-3">
    <div class="form-floating">
        <input type="number" step="any" class="form-control rounded-3 border-light-subtle"
               id="nome_campo" placeholder="0.00">
        <label for="nome_campo" class="text-muted">
            <i class="bi bi-123 me-2"></i>Rótulo do Campo
        </label>
    </div>
    <span class="text-danger small" id="erroNomeCampo"></span>
</div>
```

> **ONDE colocar:** dentro do `<form>`, logo antes dos botões de rodapé (`card-footer-activity`).

---

### ⚡ PASSO 3 — JAVASCRIPT

> O JS tem **3 funções diferentes** para lidar com o campo. Siga cada uma.

#### 3A — No JS de **CADASTRO** (`profissional_novo.js`, `responsavel_novo.js`, etc.)

**Procure o bloco `formData.append(...)` e adicione:**

```js
// ✅ Adicione junto com os outros appends
formData.append('nome_campo', document.getElementById('nome_campo').value.trim());
```

#### 3B — No JS de **EDIÇÃO/ALTERAR** (`alterar_profissional.js`, `responsavel_alterar.js`, etc.)

**Parte 1 — Carregar dados (função `buscarProfissional` / `buscar`):**

```js
// ✅ Adicione dentro do bloco "if (resposta.status === 'ok')"
// Logo após os outros document.getElementById(...).value = ...
document.getElementById('nome_campo').value = prof.nome_campo || '';
```

**Parte 2 — Enviar dados (dentro do `FormData` no `submit`):**

```js
// ✅ Adicione junto com os outros fd.append(...)
fd.append('nome_campo', document.getElementById('nome_campo').value.trim());
```

#### 3C — No JS de **LISTAGEM** (`listar-profissionais.js`, `lista_pessoa_tea.js`, etc.)

**Parte 1 — Cabeçalho da tabela (`<thead>`):**

```js
// ✅ Adicione um <th> no cabeçalho, dentro da string html = `...`
<th class="py-3">Nome do Campo</th>
```

**Parte 2 — Linha de dados (`<tbody>`):**

```js
// ✅ Adicione um <td> na linha de cada registro
<td>${prof.nome_campo || '--'}</td>
```

---

### ⚡ PASSO 4 — PHP

#### 4A — PHP de **LISTAGEM/BUSCA** (`listar-profissionais.php`, `responsavel_get.php`, `pessoa_tea_get.php`)

**No SELECT, adicione a coluna:**

```php
// ANTES (exemplo):
$sql = "SELECT U.id_usuario, U.nome, U.email FROM Usuario U ...";

// DEPOIS (adicione o campo):
$sql = "SELECT U.id_usuario, U.nome, U.email, P.nome_campo FROM Usuario U ...";
//                                              ↑ adicione aqui (P = tabela do perfil)
```

#### 4B — PHP de **CADASTRO** (`usuario_novo.php`)

> ⚠️ Este arquivo é compartilhado! Identifique o bloco correto pelo `$tipo_usuario`.

**Procure o bloco do tipo certo (ex: `if ($tipo_usuario === 'ProfissionalSaude')`) e:**

**1. Declare a variável no topo do arquivo (junto com as outras):**

```php
// Adicione junto com as outras declarações de variável no topo:
$nome_campo = htmlspecialchars($_POST['nome_campo'] ?? '', ENT_QUOTES, 'UTF-8');
```

**2. Atualize o INSERT da tabela específica:**

```php
// ANTES:
$stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) VALUES (?, ?, ?)");
$stmt_prof->bind_param("iss", $id_usuario, $registro_profissional, $especialidade);

// DEPOIS (adicionando nome_campo):
$stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade, nome_campo) VALUES (?, ?, ?, ?)");
$stmt_prof->bind_param("isss", $id_usuario, $registro_profissional, $especialidade, $nome_campo);
//                        ↑ adicione tipo aqui (s=string, i=int, d=float/double)
//                                                                    ↑ adicione variável aqui
```

#### 4C — PHP de **ATUALIZAÇÃO** (`alterar_profissional.php`, `responsavel_alterar.php`, `pessoa_tea_alterar.php`)

**1. Declare a variável recebida do POST:**

```php
// Adicione junto com as outras variáveis recebidas pelo $_POST
$nome_campo = $_POST['nome_campo'] ?? '';
```

**2. Atualize o UPDATE da tabela específica:**

```php
// ANTES:
$sql_prof = "UPDATE ProfissionalSaude SET registro_profissional=?, especialidade=? WHERE id_usuario=?";
$stmt2->bind_param("ssi", $registro, $especialidade, $id_usuario);

// DEPOIS (adicionando nome_campo):
$sql_prof = "UPDATE ProfissionalSaude SET registro_profissional=?, especialidade=?, nome_campo=? WHERE id_usuario=?";
$stmt2->bind_param("sssi", $registro, $especialidade, $nome_campo, $id_usuario);
//                    ↑ novo tipo                       ↑ nova variável
```

---

## 📋 CHECKLIST DOS 10 MINUTOS

```
□ 1. SQL   → ALTER TABLE para adicionar a coluna no banco
□ 2. HTML  → Adicionar o <input> no formulário (cadastro E alterar)
□ 3. JS    → formData.append() no cadastro
□ 3. JS    → Preencher o campo no buscar/carregar (alterar)
□ 3. JS    → fd.append() no submit do alterar
□ 3. JS    → <th> e <td> na listagem (se pedirem para listar)
□ 4. PHP   → Variável $_POST no topo do arquivo
□ 4. PHP   → Campo no SELECT (listagem)
□ 4. PHP   → Campo no INSERT (cadastro) + bind_param
□ 4. PHP   → Campo no UPDATE (alterar) + bind_param
```

---

## 🧩 EXEMPLO COMPLETO — CAMPO "data_formacao" (DATE) NO PROFISSIONAL

### SQL:
```sql
ALTER TABLE ProfissionalSaude ADD COLUMN data_formacao DATE NULL;
```

### HTML (`cadastro_profissional.html`):
```html
<div class="mb-3">
    <div class="form-floating">
        <input type="date" class="form-control rounded-3 border-light-subtle" id="data_formacao">
        <label for="data_formacao" class="text-muted">
            <i class="bi bi-calendar-check me-2"></i>Data de Formação
        </label>
    </div>
    <span class="text-danger small" id="erroDataFormacao"></span>
</div>
```

### JS — Cadastro (`profissional_novo.js`):
```js
formData.append('data_formacao', document.getElementById('data_formacao').value);
```

### JS — Alterar — Buscar (`alterar_profissional.js`, dentro do `buscarProfissional`):
```js
document.getElementById('data_formacao').value = prof.data_formacao
    ? prof.data_formacao.split(' ')[0]   // remove horário se vier do banco
    : '';
```

### JS — Alterar — Enviar (`alterar_profissional.js`, dentro do `FormData` do submit):
```js
fd.append('data_formacao', document.getElementById('data_formacao').value);
```

### JS — Listagem (`listar-profissionais.js`):
```js
// No <thead>:
<th class="py-3">Formação</th>

// No <tbody> (dentro do forEach):
<td>${prof.data_formacao ? new Date(prof.data_formacao + 'T00:00:00').toLocaleDateString('pt-BR') : '--'}</td>
```

### PHP — Listagem (`listar-profissionais.php`):
```php
// No SELECT, adicione P.data_formacao após especialidade:
$sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf,
               P.especialidade, P.registro_profissional, P.data_formacao, ...";
```

### PHP — Cadastro (`usuario_novo.php`):
```php
// No topo, junto com as outras variáveis:
$data_formacao = $_POST['data_formacao'] ?? null;

// No bloco ProfissionalSaude, atualize o INSERT:
$stmt_prof = $conexao->prepare(
    "INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade, data_formacao)
     VALUES (?, ?, ?, ?)"
);
$stmt_prof->bind_param("isss", $id_usuario, $registro_profissional, $especialidade, $data_formacao);
```

### PHP — Atualização (`alterar_profissional.php`):
```php
// Logo após as outras variáveis $_POST:
$data_formacao = $_POST['data_formacao'] ?? null;

// No UPDATE ProfissionalSaude:
$sql_prof = "UPDATE ProfissionalSaude SET registro_profissional=?, especialidade=?, data_formacao=? WHERE id_usuario=?";
$stmt2 = $conexao->prepare($sql_prof);
$stmt2->bind_param("sssi", $registro, $especialidade, $data_formacao, $id_usuario);
```

---

## 🎯 DICAS RÁPIDAS PARA O DIA DO TESTE

1. **Leia o PHP de listagem** para saber quais colunas já existem no SELECT (coluna nova entra aqui).
2. **Não altere bind_param sem atualizar o SQL** — os `?` no SQL e os tipos no bind_param devem bater.
3. **Data no JS:** ao exibir na tabela, use `.toLocaleDateString('pt-BR')` para formatar.
4. **Float/Double no bind_param:** use `d` (não `f`). Ex: `bind_param("sd", $nome, $nota)`.
5. **Campo NULL vs vazio:** use `?? null` no PHP para campos opcionais, `?? ''` para strings obrigatórias.
6. **Se quebrar o JSON** do PHP, abra o PHP direto no navegador e leia o erro.
7. **Identifique primeiro a TABELA** onde o campo vai (perfil específico ou Usuario base).