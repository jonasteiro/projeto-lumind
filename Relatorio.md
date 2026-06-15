# 📖 Guia Definitivo: Super Combo (5 Campos) em Relatórios

Este guia documenta a inserção simultânea de cinco campos de tipos diferentes (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **Relatorio**, integrados perfeitamente com o Banco de Dados, PHP, formulários HTML, o Modal de exibição e o JavaScript.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Adicionamos os 5 campos na tabela de uma só vez.

**Onde posicionar:** Execute no seu SGBD (phpMyAdmin, DBeaver, etc).

```sql
ALTER TABLE Relatorio
ADD COLUMN titulo_relatorio VARCHAR(150) NULL,
ADD COLUMN recomendacoes_casa TEXT NULL,
ADD COLUMN data_proxima_avaliacao DATE NULL,
ADD COLUMN duracao_minutos INT NULL,
ADD COLUMN progresso_percentual FLOAT NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Criação (HTML do Formulário)

Adicionamos os 5 inputs no formulário onde o responsável cria o relatório. 

**Onde posicionar:** No arquivo de criação (ex: `relatorio_responsavel.html`), dentro da tag `<form>`.

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
            id_responsavel, id_pessoa_tea, data, descricao, 
            titulo_relatorio, recomendacoes_casa, data_proxima_avaliacao, duracao_minutos, progresso_percentual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexao->prepare($sql);

// Ordem: i(id_resp), i(id_tea), s(data), s(desc), s(titulo), s(recom), s(data_prox), i(duracao), d(progresso)
// Resultado do bind_param: "iisssssid"
$stmt->bind_param("iisssssid", 
    $id_responsavel, $id_pessoa_tea, $data, $descricao, 
    $titulo_relatorio, $recomendacoes_casa, $data_proxima_avaliacao, $duracao_minutos, $progresso_percentual
);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

**Onde posicionar:** No arquivo `relatorios_listar.php`.

```sql
-- ATENÇÃO REFORÇADA PARA AS VÍRGULAS AQUI
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

## 🖥️ Passo 6: A Interface de Exibição (HTML do Modal)

Estrutura visual moderna preparada para receber os 5 novos dados.

**Onde posicionar:** No arquivo `lista_relatorios_responsaveis.html`, substituindo a estrutura antiga do Modal.

```html
<div class="modal fade" id="modalRelatorio" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
            <div class="modal-header bg-light border-bottom p-4">
                <h5 class="modal-title fw-bold" style="color: #167ebc;">
                    <i class="bi bi-file-earmark-text me-2"></i> Detalhes do Relatório
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-4 p-md-5">
                
                <h4 id="modal-titulo-relatorio" class="fw-bold mb-4 text-dark">Carregando título...</h4>
                
                <div class="row g-3 mb-4 bg-light p-3 rounded-3 border border-light-subtle align-items-center">
                    
                    <div class="col-6 col-md-3 border-end border-light-subtle">
                        <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-calendar-event me-1"></i> Data de Envio</label>
                        <p id="modal-data" class="mb-0 fw-bold fs-6 text-dark">--</p>
                    </div>

                    <div class="col-6 col-md-3 border-end-md border-light-subtle">
                        <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-clock-history me-1"></i> Duração</label>
                        <p id="modal-duracao" class="mb-0 fw-bold fs-6 text-dark">--</p>
                    </div>

                    <div class="col-6 col-md-3 border-end border-light-subtle">
                        <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-calendar-plus me-1"></i> Retorno</label>
                        <p id="modal-data-prox" class="mb-0 fw-bold fs-6 text-dark">--</p>
                    </div>

                    <div class="col-6 col-md-3">
                        <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-graph-up-arrow me-1"></i> Progresso</label>
                        <p id="modal-progresso" class="mb-0 fw-bold fs-6 text-primary">--</p>
                    </div>

                </div>
                
                <div class="mb-4">
                    <label class="text-muted small text-uppercase fw-bold mb-2"><i class="bi bi-card-text me-1"></i> Descrição Completa</label>
                    <div id="modal-descricao" class="p-4 bg-white rounded-3 border border-light-subtle shadow-sm" 
                         style="white-space: pre-wrap; word-wrap: break-word; min-height: 100px; max-height: 250px; overflow-y: auto; color: #495057; font-size: 0.95rem; line-height: 1.6;">
                    </div>
                </div>

                <div class="mb-0">
                    <label class="text-muted small text-uppercase fw-bold mb-2"><i class="bi bi-house-heart me-1"></i> Recomendações para Casa</label>
                    <div id="modal-recomendacoes" class="p-4 rounded-3 border border-info-subtle shadow-sm" 
                         style="background-color: #f0f9ff; white-space: pre-wrap; word-wrap: break-word; color: #055160; font-size: 0.95rem; line-height: 1.6;">
                    </div>
                </div>
                
            </div>
            
            <div class="modal-footer border-top bg-light p-3">
                <button type="button" class="btn btn-outline-secondary rounded-pill px-4 fw-semibold" data-bs-dismiss="modal">
                    Fechar
                </button>
            </div>
        </div>
    </div>
</div>
```

---

## 🖥️ Passo 7: Exibindo no Modal (JavaScript)

Conectamos os dados que chegaram do PHP com os IDs da estrutura visual do Modal.

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
