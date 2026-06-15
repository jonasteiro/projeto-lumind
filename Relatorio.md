# 📖 Guia de Implementação: Super Combo (5 Campos) em Relatórios

Este guia documenta a inserção simultânea de cinco campos de tipos diferentes (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **Relatorio**. 

A regra de ouro segue o fluxo: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Adicionamos todas as colunas em um único comando `ALTER TABLE`.

**Onde posicionar:** Execute diretamente no seu SGBD (phpMyAdmin, Workbench, etc).

```sql
ALTER TABLE Relatorio
ADD COLUMN titulo_relatorio VARCHAR(150) NULL,
ADD COLUMN recomendacoes_casa TEXT NULL,
ADD COLUMN data_proxima_avaliacao DATE NULL,
ADD COLUMN duracao_minutos INT NULL,
ADD COLUMN progresso_percentual FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Criação (HTML)

Adicionamos os 5 inputs no formulário de criação do relatório. 

**Onde posicionar:** No arquivo `relatorio_responsavel.html` (ou similar), dentro da tag `<form>`.

```html
<div class="row g-3 mb-4">
    <div class="col-md-6">
        <label for="titulo_relatorio" class="form-label fw-bold">Título / Assunto</label>
        <input type="text" class="form-control" id="titulo_relatorio" name="titulo_relatorio" placeholder="Ex: Avaliação Motora Mensal" maxlength="150">
    </div>

    <div class="col-md-6">
        <label for="progresso_percentual" class="form-label fw-bold">Progresso (%)</label>
        <input type="number" step="0.01" class="form-control" id="progresso_percentual" name="progresso_percentual" placeholder="Ex: 85.5">
    </div>

    <div class="col-md-6">
        <label for="data_proxima_avaliacao" class="form-label fw-bold">Próxima Avaliação</label>
        <input type="date" class="form-control" id="data_proxima_avaliacao" name="data_proxima_avaliacao">
    </div>

    <div class="col-md-6">
        <label for="duracao_minutos" class="form-label fw-bold">Duração (Minutos)</label>
        <input type="number" step="1" min="1" class="form-control" id="duracao_minutos" name="duracao_minutos" placeholder="Ex: 45">
    </div>

    <div class="col-12">
        <label for="recomendacoes_casa" class="form-label fw-bold">Recomendações para Casa</label>
        <textarea class="form-control" id="recomendacoes_casa" name="recomendacoes_casa" rows="4" placeholder="Descreva as atividades para os pais fazerem em casa..."></textarea>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

Se você estiver usando a captura campo a campo no JS, adicione todos eles. Se estiver usando `new FormData(form)`, este passo é **automático** e você pode ignorar.

**Onde posicionar (Se for manual):** No arquivo JS de envio do relatório, antes do `fetch()`.

```javascript
// Captura e anexa os 5 campos ao FormData
formData.append('titulo_relatorio', document.getElementById('titulo_relatorio').value.trim());
formData.append('recomendacoes_casa', document.getElementById('recomendacoes_casa').value.trim());
formData.append('data_proxima_avaliacao', document.getElementById('data_proxima_avaliacao').value);
formData.append('duracao_minutos', document.getElementById('duracao_minutos').value);
formData.append('progresso_percentual', document.getElementById('progresso_percentual').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Aqui tratamos a conversão de todos os 5 tipos para garantir segurança máxima antes de salvar no banco. Lembre-se de converter vírgulas para pontos no `FLOAT`!

**Onde posicionar:** No arquivo `relatorio_salvar.php`.

**Parte A: Captura e Tratamento**
```php
// TEXT e VARCHAR (Sanitização)
$titulo_relatorio = htmlspecialchars($_POST['titulo_relatorio'] ?? '', ENT_QUOTES, 'UTF-8');
$recomendacoes_casa = htmlspecialchars($_POST['recomendacoes_casa'] ?? '', ENT_QUOTES, 'UTF-8');

// DATE (Trata vazio como nulo)
$data_proxima_avaliacao = !empty($_POST['data_proxima_avaliacao']) ? $_POST['data_proxima_avaliacao'] : null;

// INT (Força tipo inteiro)
$duracao_minutos = !empty($_POST['duracao_minutos']) ? (int) $_POST['duracao_minutos'] : null;

// FLOAT (Troca vírgula por ponto e força tipo float)
$progresso_bruto = !empty($_POST['progresso_percentual']) ? $_POST['progresso_percentual'] : '0';
$progresso_percentual = (float) str_replace(',', '.', $progresso_bruto);
```

**Parte B: Atualizando o Banco de Dados**
```php
// Atualize sua string SQL para incluir os novos campos (Exemplo genérico)
$sql = "INSERT INTO Relatorio (
            id_responsavel, id_pessoa_tea, data, descricao, 
            titulo_relatorio, recomendacoes_casa, data_proxima_avaliacao, duracao_minutos, progresso_percentual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
$stmt = $conexao->prepare($sql);

// Atualização do bind_param
// id_responsavel (i)
// id_pessoa_tea (i)
// data (s)
// descricao (s)
// titulo_relatorio (s - VARCHAR)
// recomendacoes_casa (s - TEXT)
// data_proxima_avaliacao (s - DATE)
// duracao_minutos (i - INT)
// progresso_percentual (d - FLOAT)
// RESULTADO DA STRING: "iisssssid"

$stmt->bind_param("iisssssid", 
    $id_responsavel, $id_pessoa_tea, $data, $descricao, 
    $titulo_relatorio, $recomendacoes_casa, $data_proxima_avaliacao, $duracao_minutos, $progresso_percentual
);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Adicione as novas colunas na sua consulta de listagem.

**Onde posicionar:** No arquivo `relatorios_listar.php`.

```sql
SELECT 
    id_relatorio, 
    data, 
    descricao,
    titulo_relatorio,
    recomendacoes_casa,
    data_proxima_avaliacao,
    duracao_minutos,
    progresso_percentual
FROM Relatorio 
WHERE id_responsavel = ?
```

---

## 🖥️ Passo 6: Exibindo no Modal (JavaScript)

Na hora de exibir no modal, crie os blocos HTML formatando cada tipo de dado adequadamente (O `DATE` vira padrão brasileiro, o `FLOAT` vira porcentagem, etc.).

**Onde posicionar:** No arquivo JS que preenche o Modal (ex: `lista_relatorios.js`), dentro da função `abrirModal`.

```javascript
// 1. Puxa os elementos do HTML (certifique-se de que eles existem no seu modalRelatorio)
const elTitulo = document.getElementById('modal-titulo-relatorio');
const elRecomendacoes = document.getElementById('modal-recomendacoes');
const elDataProx = document.getElementById('modal-data-prox');
const elDuracao = document.getElementById('modal-duracao');
const elProgresso = document.getElementById('modal-progresso');

// 2. Preenche formatando
if (elTitulo) elTitulo.textContent = rel.titulo_relatorio || 'Relatório sem título';

if (elRecomendacoes) {
    elRecomendacoes.textContent = rel.recomendacoes_casa || 'Nenhuma recomendação registrada.';
}

if (elDataProx) {
    elDataProx.textContent = rel.data_proxima_avaliacao 
        ? new Date(rel.data_proxima_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR') 
        : '--';
}

if (elDuracao) {
    elDuracao.textContent = rel.duracao_minutos ? `${rel.duracao_minutos} min` : '--';
}

if (elProgresso) {
    const formatado = parseFloat(rel.progresso_percentual || 0).toFixed(1).replace('.', ',');
    elProgresso.textContent = `${formatado}%`;
}
```
