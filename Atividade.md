# 📖 Guia de Implementação: Super Combo (5 Campos) em Atividades

Este guia documenta a inserção simultânea de cinco campos de tipos diferentes (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **Atividade**, totalmente integrada com o fluxo automático do `FormData(form)` e a tela de visualização profissional.

O fluxo de desenvolvimento segue a ordem: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Criamos todas as 5 colunas de uma só vez na tabela principal.

**Onde posicionar:** Execute este comando diretamente no seu SGBD (phpMyAdmin).

```sql
ALTER TABLE Atividade
ADD COLUMN subtitulo_atividade VARCHAR(150) NULL,
ADD COLUMN objetivos_terapeuticos TEXT NULL,
ADD COLUMN data_vencimento DATE NULL,
ADD COLUMN tempo_estimado_minutos INT NULL,
ADD COLUMN peso_avaliacao FLOAT NULL DEFAULT 1.00;
```

---

## 🖥️ Passo 2: A Interface de Criação (HTML do Formulário)

Adicionamos os inputs dentro do formulário de publicação da atividade. 

**Onde posicionar:** No arquivo `publicar_atividade.html`, dentro de `<form id="formPublicarAtividade">`, logo abaixo do campo de categoria/data de publicação.

```html
<div class="row g-3 mb-4">
    <div class="col-md-6">
        <div class="form-floating">
            <input type="text" id="subtitulo_atividade" name="subtitulo_atividade" class="form-control rounded-3 border-light-subtle" placeholder="Subtítulo" maxlength="150" />
            <label for="subtitulo_atividade" class="text-muted"><i class="bi bi-type me-2"></i> Subtítulo da Atividade</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="0.01" min="0" id="peso_avaliacao" name="peso_avaliacao" class="form-control rounded-3 border-light-subtle" placeholder="Peso" />
            <label for="peso_avaliacao" class="text-muted"><i class="bi bi-star-half me-2"></i> Peso na Avaliação</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="date" id="data_vencimento" name="data_vencimento" class="form-control rounded-3 border-light-subtle" placeholder="Vencimento" />
            <label for="data_vencimento" class="text-muted"><i class="bi bi-calendar-x me-2"></i> Prazo / Vencimento</label>
        </div>
    </div>

    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="1" min="1" id="tempo_estimado_minutos" name="tempo_estimado_minutos" class="form-control rounded-3 border-light-subtle" placeholder="Tempo" />
            <label for="tempo_estimado_minutos" class="text-muted"><i class="bi bi-hourglass-split me-2"></i> Tempo Estimado (Minutos)</label>
        </div>
    </div>

    <div class="col-12">
        <div class="form-floating">
            <textarea id="objetivos_terapeuticos" name="objetivos_terapeuticos" class="form-control rounded-3 border-light-subtle" placeholder="Objetivos" style="height: 100px;"></textarea>
            <label for="objetivos_terapeuticos" class="text-muted"><i class="bi bi-bullseye me-2"></i> Objetivos Terapêuticos Clínicos</label>
        </div>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript do Formulário)

**🚨 ATENÇÃO REFORÇADA:** Como o seu arquivo `publicar_atividade.js` utiliza a coleta nativa e dinâmica `const formData = new FormData(form);`, **VOCÊ NÃO PRECISA MODIFICAR NADA NO JAVASCRIPT DE ENVIO**. O navegador captura todos os 5 campos novos automaticamente por causa do atributo `name="..."` que colocámos no HTML do Passo 2!

---

## 🖧 Passo 4: Recebendo e Salvando (PHP de Criação)

Tratamos e sanitizamos os dados recebidos via POST e atualizamos a query de inserção. 

**Onde posicionar:** No arquivo `php/atividades/criar_atividade.php`.

**Parte A: Captura e Higienização (Junto aos outros $_POST)**
```php
// Tratamento dos 5 campos novos da Atividade
$subtitulo_atividade = htmlspecialchars($_POST['subtitulo_atividade'] ?? '', ENT_QUOTES, 'UTF-8');
$objetivos_terapeuticos = htmlspecialchars($_POST['objetivos_terapeuticos'] ?? '', ENT_QUOTES, 'UTF-8');
$data_vencimento = !empty($_POST['data_vencimento']) ? $_POST['data_vencimento'] : null;
$tempo_estimado_minutos = !empty($_POST['tempo_estimado_minutos']) ? (int) $_POST['tempo_estimado_minutos'] : null;

// Conversão segura de FLOAT (Substitui vírgula brasileira por ponto decimal)
$peso_bruto = !empty($_POST['peso_avaliacao']) ? $_POST['peso_avaliacao'] : '1.00';
$peso_avaliacao = (float) str_replace(',', '.', $peso_bruto);
```

**Parte B: Query de Inserção e bind_param**
```php
// 1. Atualizamos o INSERT adicionando os 5 novos campos e mais 5 interrogações '?' no final
$sql_insert = "INSERT INTO Atividade (
                    id_profissional, titulo, descricao, data_publicacao, categoria, arquivo_anexo, tipo_arquivo, data_limite,
                    subtitulo_atividade, objetivos_terapeuticos, data_vencimento, tempo_estimado_minutos, peso_avaliacao
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                   
$stmt = $conexao->prepare($sql_insert);
    
if (!$stmt) {
    throw new Exception("Erro interno do Banco de Dados: " . $conexao->error);
}

// 2. Atualizamos o bind_param!
// Campos originais: i(id_prof), s(titulo), s(desc), s(data_pub), s(categ), s(arq), s(tipo_arq), s(data_lim) -> "isssssss"
// Novos campos adicionados: s(subtitulo), s(objetivos), s(vencimento), i(tempo_int), d(peso_float) -> "sssid"
// Resultado final da string de tipos: "issssssssssid"
$stmt->bind_param("issssssssssid", 
    $id_profissional, $titulo, $descricao, $data_publicacao, $categoria, $arquivo_binario, $tipo_arquivo, $data_limite,
    $subtitulo_atividade, $objetivos_terapeuticos, $data_vencimento, $tempo_estimado_minutos, $peso_avaliacao
);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP de Detalhes)

Para as informações retornarem do banco e aparecerem na tela, a consulta de seleção precisa trazer as novas colunas.

**Onde posicionar:** No arquivo `php/atividades/atividade_submissoes.php`.

```sql
/* Atualize a query $check adicionando os 5 campos novos antes do FROM (Atenção às vírgulas!) */
$check = $conexao->prepare("
    SELECT 
        id_atividade, titulo, descricao, categoria, data_publicacao, data_limite, tipo_arquivo, TO_BASE64(arquivo_anexo) AS arquivo_anexo,
        subtitulo_atividade, objetivos_terapeuticos, data_vencimento, tempo_estimado_minutos, peso_avaliacao
    FROM Atividade 
    WHERE id_atividade = ? AND id_profissional = ? 
    LIMIT 1
");
```

---

## 🖥️ Passo 6: Exibindo na Tela (HTML e JavaScript de Detalhes)

Vamos desenhar os 5 novos dados na interface estruturada de visualização.

**Onde posicionar a estrutura HTML:** No arquivo `view_atividade_profissional.html`, procure a `<section class="content p-4">` e adicione este bloco logo abaixo da div do `descricao-atividade`:

```html
<div class="mt-3 bg-light p-3 rounded-3 border border-light-subtle">
    <h5 id="view-subtitulo" class="fw-bold text-secondary mb-3"></h5>
    
    <div class="row text-muted small mb-3">
        <div class="col-md-4 mb-2"><i class="bi bi-calendar-x me-1"></i> <strong>Vence em:</strong> <span id="view-vencimento"></span></div>
        <div class="col-md-4 mb-2"><i class="bi bi-hourglass-split me-1"></i> <strong>Duração:</strong> <span id="view-tempo"></span></div>
        <div class="col-md-4 mb-2"><i class="bi bi-star-half me-1"></i> <strong>Peso Avaliação:</strong> <span id="view-peso"></span></div>
    </div>
    
    <div class="pt-2 border-top border-light-subtle">
        <p class="mb-1 text-dark fw-bold"><i class="bi bi-bullseye me-1 text-danger"></i> Objetivos Clínicos:</p>
        <p id="view-objetivos" class="mb-0 text-muted" style="white-space: pre-wrap;"></p>
    </div>
</div>
```

**Onde posicionar a Injeção JS:** No arquivo `view_atividade_profissional.js`, vá até o final da sua função `renderizarAtividade(atividade)` e adicione as regras de exibição formatada:

```javascript
function renderizarAtividade(atividade) {
    // ... [código original de título, categoria, descrição continua igual aqui] ...

    // INJEÇÃO DOS 5 NOVOS CAMPOS COM HIGIENIZAÇÃO DE NULOS
    
    // 1. VARCHAR (Subtítulo)
    document.getElementById('view-subtitulo').textContent = atividade.subtitulo_atividade || '';

    // 2. DATE (Vencimento convertido para o padrão brasileiro)
    const elVenc = document.getElementById('view-vencimento');
    if (atividade.data_vencimento && atividade.data_vencimento !== '0000-00-00') {
        elVenc.textContent = new Date(atividade.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
    } else {
        elVenc.textContent = 'Não definido';
    }

    // 3. INT (Tempo em Minutos)
    document.getElementById('view-tempo').textContent = atividade.tempo_estimado_minutos ? `${atividade.tempo_estimado_minutos} min` : 'Não estimado';

    // 4. FLOAT (Peso formatado com vírgula)
    const pesoFloat = parseFloat(atividade.peso_avaliacao || 1.00);
    document.getElementById('view-peso').textContent = pesoFloat.toFixed(2).replace('.', ',');

    // 5. TEXT (Objetivos Terapêuticos)
    document.getElementById('view-objetivos').textContent = atividade.objetivos_terapeuticos || 'Nenhum objetivo específico listado.';

    // ... [código original do arquivo_anexo continua igual abaixo] ...
}
```
