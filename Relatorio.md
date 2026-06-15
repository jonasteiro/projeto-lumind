# 📖 Guia Definitivo: Super Combo (5 Campos) em Relatórios

Este guia documenta a inserção simultânea de cinco campos de tipos diferentes (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **Relatorio**, integrados perfeitamente com o Banco de Dados, PHP, HTML e o novo Modal moderno.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

**Onde posicionar:** Execute no seu SGBD (phpMyAdmin).

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

Adiciona os campos no formulário de criação do relatório.

**Onde posicionar:** No arquivo `relatorio_responsavel.html`, dentro da tag `<form>`.

```html
<div class="row g-3 mb-4">
    <div class="col-md-6">
        <label for="titulo_relatorio" class="form-label fw-bold small text-uppercase">Título / Assunto</label>
        <input type="text" class="form-control rounded-3" id="titulo_relatorio" name="titulo_relatorio" placeholder="Ex: Avaliação Motora" maxlength="150">
    </div>

    <div class="col-md-6">
        <label for="progresso_percentual" class="form-label fw-bold small text-uppercase">Progresso (%)</label>
        <input type="number" step="0.01" class="form-control rounded-3" id="progresso_percentual" name="progresso_percentual" placeholder="Ex: 85.5">
    </div>

    <div class="col-md-6">
        <label for="data_proxima_avaliacao" class="form-label fw-bold small text-uppercase">Próxima Avaliação</label>
        <input type="date" class="form-control rounded-3" id="data_proxima_avaliacao" name="data_proxima_avaliacao">
    </div>

    <div class="col-md-6">
        <label for="duracao_minutos" class="form-label fw-bold small text-uppercase">Duração (Minutos)</label>
        <input type="number" step="1" min="1" class="form-control rounded-3" id="duracao_minutos" name="duracao_minutos" placeholder="Ex: 45">
    </div>

    <div class="col-12">
        <label for="recomendacoes_casa" class="form-label fw-bold small text-uppercase">Recomendações para Casa</label>
        <textarea class="form-control rounded-3" id="recomendacoes_casa" name="recomendacoes_casa" rows="3" placeholder="Anotações adicionais para a rotina em casa..."></textarea>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

*(Nota: Pule este passo se o seu JS já utiliza `new FormData(form)`. Se for manual, anexe os dados abaixo).*

**Onde posicionar:** No arquivo JS que envia os dados (ex: `relatorio_novo.js`).

```javascript
formData.append('titulo_relatorio', document.getElementById('titulo_relatorio').value.trim());
formData.append('recomendacoes_casa', document.getElementById('recomendacoes_casa').value.trim());
formData.append('data_proxima_avaliacao', document.getElementById('data_proxima_avaliacao').value);
formData.append('duracao_minutos', document.getElementById('duracao_minutos').value);
formData.append('progresso_percentual', document.getElementById('progresso_percentual').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

**Onde posicionar:** No arquivo PHP que salva o relatório (ex: `salvar_relatorio.php`).

**Parte A: Captura e Conversão (No topo do arquivo)**
```php
// Tratamento dos 5 campos novos
$titulo_relatorio = htmlspecialchars($_POST['titulo_relatorio'] ?? '', ENT_QUOTES, 'UTF-8');
$recomendacoes_casa = htmlspecialchars($_POST['recomendacoes_casa'] ?? '', ENT_QUOTES, 'UTF-8');
$data_proxima_avaliacao = !empty($_POST['data_proxima_avaliacao']) ? $_POST['data_proxima_avaliacao'] : null;
$duracao_minutos = !empty($_POST['duracao_minutos']) ? (int) $_POST['duracao_minutos'] : null;

// Conversão segura de FLOAT (Troca vírgula por ponto)
$progresso_bruto = !empty($_POST['progresso_percentual']) ? $_POST['progresso_percentual'] : '0';
$progresso_percentual = (float) str_replace(',', '.', $progresso_bruto);
```

**Parte B: Inserção Segura no Banco**
```php
$sql = "INSERT INTO Relatorio (
            id_responsavel, 
            id_pessoa_tea, 
            data, 
            descricao, 
            titulo_relatorio, 
            recomendacoes_casa, 
            data_proxima_avaliacao, 
            duracao_minutos, 
            progresso_percentual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexao->prepare($sql);

// Ordem: i(id_resp), i(id_tea), s(data), s(desc), s(titulo), s(recom), s(data_prox), i(duracao), d(progresso)
// Resultado do bind_param: "iisssssid"
$stmt->bind_param("iisssssid", 
    $id_responsavel, 
    $id_pessoa_tea, 
    $data, 
    $descricao, 
    $titulo_relatorio, 
    $recomendacoes_casa, 
    $data_proxima_avaliacao, 
    $duracao_minutos, 
    $progresso_percentual
);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

**⚠️ ATENÇÃO:** Preste muita atenção nas vírgulas neste bloco. Uma faltando derruba a página.

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
ORDER BY data DESC
```

---

## 🖥️ Passo 6: Exibindo no Modal (JavaScript)

**Onde posicionar:** No arquivo `lista_relatorios.js`, substituindo a sua função `abrirModal`.

```javascript
window.abrirModal = function(rel) {
    // 1. Campos Base
    const elData = document.getElementById('modal-data');
    if(elData) elData.textContent = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
    
    const elDescricao = document.getElementById('modal-descricao');
    if(elDescricao) elDescricao.textContent = rel.descricao;

    // 2. Os 5 Novos Campos (com travas de segurança)
    const elTitulo = document.getElementById('modal-titulo-relatorio');
    if (elTitulo) elTitulo.textContent = rel.titulo_relatorio || 'Relatório sem título';

    const elRecomendacoes = document.getElementById('modal-recomendacoes');
    if (elRecomendacoes) {
        elRecomendacoes.textContent = rel.recomendacoes_casa || 'Nenhuma recomendação registrada.';
    }

    const elDataProx = document.getElementById('modal-data-prox');
    if (elDataProx) {
        elDataProx.textContent = rel.data_proxima_avaliacao 
            ? new Date(rel.data_proxima_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR') 
            : '--';
    }

    const elDuracao = document.getElementById('modal-duracao');
    if (elDuracao) {
        elDuracao.textContent = rel.duracao_minutos ? `${rel.duracao_minutos} min` : '--';
    }

    const elProgresso = document.getElementById('modal-progresso');
    if (elProgresso) {
        if (rel.progresso_percentual !== null && rel.progresso_percentual !== undefined) {
            const formatado = parseFloat(rel.progresso_percentual).toFixed(2).replace('.', ',');
            elProgresso.textContent = `${formatado}%`;
        } else {
            elProgresso.textContent = '--';
        }
    }

    // Abre o Modal do Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    modal.show();
};
```
