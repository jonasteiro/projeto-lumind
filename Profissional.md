# 📖 Guia Definitivo: Super Combo (5 Campos) em Profissional de Saúde

Este guia documenta a inserção simultânea de cinco novos campos (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **ProfissionalSaude**, passando pelo banco de dados, formulário de cadastro, salvamento no PHP e exibição na listagem.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Adicionamos os 5 campos na tabela do Profissional.

**Onde posicionar:** Execute este comando diretamente no seu SGBD (phpMyAdmin, DBeaver, etc).

```sql
ALTER TABLE ProfissionalSaude
ADD COLUMN local_atendimento VARCHAR(150) NULL,
ADD COLUMN resumo_curriculo TEXT NULL,
ADD COLUMN data_formacao DATE NULL,
ADD COLUMN anos_experiencia INT NULL DEFAULT 0,
ADD COLUMN valor_consulta FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML do Formulário)

Adicione os novos inputs no formulário de cadastro do profissional.

**Onde posicionar:** No arquivo de cadastro (ex: `cadastro_profissional.html`), dentro do `<form>`.

```html
<h5 class="mt-4 mb-3 text-primary border-bottom pb-2">Informações Clínicas e de Carreira</h5>
<div class="row g-3 mb-4">
    <div class="col-md-6">
        <div class="form-floating">
            <input type="text" class="form-control" id="local_atendimento" name="local_atendimento" placeholder="Ex: Clínica Central" maxlength="150">
            <label for="local_atendimento"><i class="bi bi-geo-alt me-2"></i> Local de Atendimento</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="0.01" min="0" class="form-control" id="valor_consulta" name="valor_consulta" placeholder="Ex: 150.00">
            <label for="valor_consulta"><i class="bi bi-currency-dollar me-2"></i> Valor da Consulta (R$)</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="date" class="form-control" id="data_formacao" name="data_formacao">
            <label for="data_formacao"><i class="bi bi-mortarboard me-2"></i> Data de Formação</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="1" min="0" class="form-control" id="anos_experiencia" name="anos_experiencia" placeholder="Ex: 5">
            <label for="anos_experiencia"><i class="bi bi-briefcase me-2"></i> Anos de Experiência</label>
        </div>
    </div>

    <div class="col-12">
        <div class="form-floating">
            <textarea class="form-control" id="resumo_curriculo" name="resumo_curriculo" style="height: 100px;" placeholder="Resumo profissional..."></textarea>
            <label for="resumo_curriculo"><i class="bi bi-file-person me-2"></i> Resumo do Currículo</label>
        </div>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

*(Lembrete: Se o JS de cadastro usa `new FormData(form)`, este passo é automático e não precisa ser feito. Caso o envio seja manual com `.append`, adicione as linhas abaixo).*

```javascript
formData.append('local_atendimento', document.getElementById('local_atendimento').value.trim());
formData.append('resumo_curriculo', document.getElementById('resumo_curriculo').value.trim());
formData.append('data_formacao', document.getElementById('data_formacao').value);
formData.append('anos_experiencia', document.getElementById('anos_experiencia').value);
formData.append('valor_consulta', document.getElementById('valor_consulta').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Sanitização dos dados, conversão de formatos e a rigorosa atualização do `bind_param`.

**Onde posicionar:** No arquivo `usuario_novo.php`.

**Parte A: Captura e Tratamento (No topo do arquivo)**
```php
$local_atendimento = htmlspecialchars($_POST['local_atendimento'] ?? '', ENT_QUOTES, 'UTF-8');
$resumo_curriculo = htmlspecialchars($_POST['resumo_curriculo'] ?? '', ENT_QUOTES, 'UTF-8');
$data_formacao = !empty($_POST['data_formacao']) ? $_POST['data_formacao'] : null;
$anos_experiencia = !empty($_POST['anos_experiencia']) ? (int) $_POST['anos_experiencia'] : 0;

// Trata a vírgula do FLOAT
$valor_bruto = !empty($_POST['valor_consulta']) ? $_POST['valor_consulta'] : '0';
$valor_consulta = (float) str_replace(',', '.', $valor_bruto);
```

**Parte B: Atualizando o INSERT do Profissional**
```php
// Localize o bloco `if ($tipo_usuario === 'ProfissionalSaude') {`
$stmt_prof = $conexao->prepare("
    INSERT INTO ProfissionalSaude (
        id_usuario, registro_profissional, especialidade, 
        local_atendimento, resumo_curriculo, data_formacao, anos_experiencia, valor_consulta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");

// Bind Param: 8 Variáveis
// Ordem: i(id), s(reg), s(espec), s(local), s(resumo), s(data), i(anos), d(valor)
// Resultado rigoroso: "isssssid"
$stmt_prof->bind_param("isssssid", 
    $id_usuario, 
    $registro_profissional, 
    $especialidade, 
    $local_atendimento, 
    $resumo_curriculo, 
    $data_formacao, 
    $anos_experiencia, 
    $valor_consulta
);

$stmt_prof->execute();
$stmt_prof->close();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Atualize o SELECT para que a listagem consiga enxergar as novas colunas.

**Onde posicionar:** No arquivo PHP que busca a lista de profissionais (ex: `profissionais_get.php`).

```sql
SELECT 
    U.id_usuario, U.nome, U.email, U.telefone, 
    P.registro_profissional, P.especialidade, 
    P.local_atendimento, P.resumo_curriculo, P.data_formacao, P.anos_experiencia, P.valor_consulta
FROM Usuario U
INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
WHERE U.tipo_usuario = 'ProfissionalSaude'
ORDER BY U.nome ASC
```

---

## 🖥️ Passo 6: Estrutura da Tabela (HTML)

Prepare a tabela para receber as novas colunas alinhadas.

**Onde posicionar:** No arquivo HTML que lista os profissionais (ex: `listar_profissionais.html`).

```html
<table class="table table-hover align-middle mb-0">
    <thead class="table-light">
        <tr>
            <th class="text-secondary fw-semibold py-3 ps-3">Profissional</th>
            <th class="text-secondary fw-semibold py-3">Especialidade</th>
            <th class="text-secondary fw-semibold py-3">Local / Experiência</th>
            <th class="text-secondary fw-semibold py-3">Formação</th>
            <th class="text-secondary fw-semibold py-3">Valor Consulta</th>
            <th class="text-secondary fw-semibold py-3 text-end pe-3">Ações</th>
        </tr>
    </thead>
    <tbody id="tabela-profissionais-body">
        <tr>
            <td colspan="6" class="text-center py-5 text-muted">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <p class="mb-0">Carregando profissionais...</p>
            </td>
        </tr>
    </tbody>
</table>
```

---

## ⚙️ Passo 7: Injeção dos Dados (JavaScript da Tabela)

Vamos preencher a tabela renderizando os novos campos blindados contra dados nulos.

**Onde posicionar:** No arquivo JS que preenche a tabela (ex: `listar_profissionais.js`), substituindo a função `preencherTabela`.

```javascript
function preencherTabela(dados, tbody) {
    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    Nenhum profissional cadastrado.
                </td>
            </tr>`;
        return;
    }

    let html = '';

    dados.forEach(prof => {
        // 1. FLOAT (Valor formatado)
        const valorFloat = parseFloat(prof.valor_consulta || 0);
        const valorFormatado = valorFloat > 0 ? `R$ ${valorFloat.toFixed(2).replace('.', ',')}` : '<span class="text-muted small">Sob Consulta</span>';

        // 2. DATE (Data de Formação)
        const dataFormacaoFormatada = prof.data_formacao 
            ? new Date(prof.data_formacao + 'T00:00:00').toLocaleDateString('pt-BR') 
            : '--';

        // 3. INT (Anos de Experiência)
        const anosTexto = prof.anos_experiencia ? `${prof.anos_experiencia} anos` : 'Iniciante';

        // 4. VARCHAR (Local)
        const local = prof.local_atendimento || 'Não informado';

        // Montando as 6 colunas HTML
        html += `
            <tr>
                <td class="ps-3 fw-medium text-dark">
                    ${prof.nome} <br>
                    <small class="text-muted">${prof.email}</small>
                </td>
                <td class="text-muted">
                    <span class="fw-semibold text-dark">${prof.especialidade || 'Geral'}</span><br>
                    <small>${prof.registro_profissional || '--'}</small>
                </td>
                <td class="text-muted">
                    <i class="bi bi-geo-alt small"></i> ${local}<br>
                    <span class="badge bg-light text-dark border mt-1">${anosTexto}</span>
                </td>
                <td class="text-muted">${dataFormacaoFormatada}</td>
                <td class="text-success fw-semibold">${valorFormatado}</td> 
                <td class="text-end pe-3">
                    <div class="btn-group">
                        <a href="perfil_profissional.html?id=${prof.id_usuario}" class="btn btn-sm btn-outline-info rounded-pill me-1" title="Ver Perfil">
                            <i class="bi bi-person-lines-fill"></i>
                        </a>
                        <button onclick="excluir(${prof.id_usuario})" class="btn btn-sm btn-outline-danger rounded-pill" title="Excluir">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}
```
