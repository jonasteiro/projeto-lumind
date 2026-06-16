# 📖 Guia Definitivo: Super Combo (5 Campos) em Responsável Legal

Este guia documenta a inserção simultânea de cinco novos campos (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **ResponsavelLegal**, garantindo a formatação correta de valores financeiros e datas.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Criamos as novas colunas na tabela do responsável.

**Onde posicionar:** Execute este comando no seu banco de dados.

```sql
ALTER TABLE ResponsavelLegal
ADD COLUMN profissao VARCHAR(100) NULL,
ADD COLUMN disponibilidade_horarios TEXT NULL,
ADD COLUMN data_entrevista DATE NULL,
ADD COLUMN numero_dependentes INT NULL DEFAULT 1,
ADD COLUMN limite_credito FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML do Formulário)

Adicione os novos inputs no formulário onde o Responsável é cadastrado.

**Onde posicionar:** No arquivo de cadastro (ex: `cadastro_responsavel.html`), dentro do `<form>`.

```html
<h5 class="mt-4 mb-3 text-primary border-bottom pb-2">Informações Complementares</h5>
<div class="row g-3 mb-4">
    <!-- 1. Campo VARCHAR (Profissão) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="text" class="form-control" id="profissao" name="profissao" placeholder="Ex: Engenheiro" maxlength="100">
            <label for="profissao"><i class="bi bi-briefcase me-2"></i> Profissão</label>
        </div>
    </div>

    <!-- 2. Campo FLOAT (Limite de Crédito) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="0.01" min="0" class="form-control" id="limite_credito" name="limite_credito" placeholder="Ex: 1500.00">
            <label for="limite_credito"><i class="bi bi-cash-coin me-2"></i> Limite de Crédito (R$)</label>
        </div>
    </div>

    <!-- 3. Campo DATE (Data da Entrevista) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="date" class="form-control" id="data_entrevista" name="data_entrevista">
            <label for="data_entrevista"><i class="bi bi-calendar-event me-2"></i> Data da Entrevista</label>
        </div>
    </div>

    <!-- 4. Campo INT (Número de Dependentes) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="1" min="1" class="form-control" id="numero_dependentes" name="numero_dependentes" placeholder="Ex: 2">
            <label for="numero_dependentes"><i class="bi bi-people me-2"></i> Nº de Dependentes</label>
        </div>
    </div>

    <!-- 5. Campo TEXT (Disponibilidade) -->
    <div class="col-12">
        <div class="form-floating">
            <textarea class="form-control" id="disponibilidade_horarios" name="disponibilidade_horarios" style="height: 100px;" placeholder="Dias e horários disponíveis..."></textarea>
            <label for="disponibilidade_horarios"><i class="bi bi-clock-history me-2"></i> Disponibilidade de Horários</label>
        </div>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

*(Lembrete: Se o JS usar `new FormData(form)`, este passo é automático. Se for envio manual com `.append`, utilize o código abaixo).*

```javascript
formData.append('profissao', document.getElementById('profissao').value.trim());
formData.append('disponibilidade_horarios', document.getElementById('disponibilidade_horarios').value.trim());
formData.append('data_entrevista', document.getElementById('data_entrevista').value);
formData.append('numero_dependentes', document.getElementById('numero_dependentes').value);
formData.append('limite_credito', document.getElementById('limite_credito').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Sanitização e conversão do FLOAT (vírgula para ponto).

**Onde posicionar:** No arquivo `usuario_novo.php`.

**Parte A: Captura e Tratamento**
```php
$profissao = htmlspecialchars($_POST['profissao'] ?? '', ENT_QUOTES, 'UTF-8');
$disponibilidade_horarios = htmlspecialchars($_POST['disponibilidade_horarios'] ?? '', ENT_QUOTES, 'UTF-8');
$data_entrevista = !empty($_POST['data_entrevista']) ? $_POST['data_entrevista'] : null;
$numero_dependentes = !empty($_POST['numero_dependentes']) ? (int) $_POST['numero_dependentes'] : 1;

// O SEGREDO DO FLOAT: Trata a vírgula do limite de crédito
$limite_bruto = !empty($_POST['limite_credito']) ? $_POST['limite_credito'] : '0';
$limite_credito = (float) str_replace(',', '.', $limite_bruto);
```

**Parte B: Atualizando o INSERT do Responsável**
```php
// Localize o bloco `elseif ($tipo_usuario === 'ResponsavelLegal') {`
$stmt_resp = $conexao->prepare("
    INSERT INTO ResponsavelLegal (
        id_usuario, id_profissional, 
        profissao, disponibilidade_horarios, data_entrevista, numero_dependentes, limite_credito
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
");

// Bind Param: 7 Variáveis
// Ordem: i(id_user), i(id_prof), s(prof), s(disp), s(data), i(dep), d(limite)
// Resultado rigoroso: "iisssid"
$stmt_resp->bind_param("iisssid", 
    $id_usuario, 
    $id_profissional_logado, 
    $profissao, 
    $disponibilidade_horarios, 
    $data_entrevista, 
    $numero_dependentes, 
    $limite_credito
);

$stmt_resp->execute();
$stmt_resp->close();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Atualize a query de listagem para trazer os novos dados.

**Onde posicionar:** No arquivo que busca os responsáveis (ex: `responsaveis_get.php`).

```sql
SELECT 
    U.id_usuario, U.nome, U.email, U.telefone, 
    R.profissao, R.disponibilidade_horarios, R.data_entrevista, R.numero_dependentes, R.limite_credito
FROM Usuario U
INNER JOIN ResponsavelLegal R ON U.id_usuario = R.id_usuario
WHERE U.tipo_usuario = 'ResponsavelLegal'
```

---

## ⚙️ Passo 6: Exibição na Tabela Dinâmica (JavaScript)

Vamos gerar a tabela e formatar os dados visuais.

**Onde posicionar:** No arquivo JS de listagem (ex: `listar_responsaveis.js`), dentro da função `preencherTabela`.

```javascript
function preencherTabela(dados) {
    if (!dados || dados.length === 0) {
        document.getElementById("lista").innerHTML = '<div class="text-center py-5 text-muted">Nenhum responsável cadastrado.</div>';
        return;
    }

    // Criando o cabeçalho (7 colunas)
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3 ps-3">Responsável</th>
                    <th class="py-3">Profissão</th>
                    <th class="py-3">Dependentes</th>
                    <th class="py-3">Entrevista</th>
                    <th class="py-3">Limite de Crédito</th>
                    <th class="py-3 text-end pe-3">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(resp => {
        // 1. FLOAT (Formatação para R$ com vírgula)
        const valorFloat = parseFloat(resp.limite_credito || 0);
        const limiteFormatado = `R$ ${valorFloat.toFixed(2).replace('.', ',')}`;

        // 2. DATE (Data formato BR)
        const dataFormatada = resp.data_entrevista 
            ? new Date(resp.data_entrevista + 'T00:00:00').toLocaleDateString('pt-BR') 
            : '--';

        // 3. INT (Dependentes)
        const dependentes = resp.numero_dependentes || 1;

        html += `
            <tr>
                <td class="ps-3 fw-bold">
                    ${resp.nome}<br>
                    <small class="text-muted fw-normal">${resp.email}</small>
                </td>
                <td class="text-muted">${resp.profissao || '--'}</td>
                <td class="text-center">
                    <span class="badge bg-light text-dark border">${dependentes}</span>
                </td>
                <td class="text-muted">${dataFormatada}</td>
                <td class="text-success fw-semibold">${limiteFormatado}</td>
                <td class="text-end pe-3">
                    <div class="btn-group">
                        <button onclick="excluir(${resp.id_usuario})" class="btn btn-sm btn-outline-danger border-0">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}
```
