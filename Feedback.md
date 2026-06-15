# 📖 Guia de Implementação: Combo de Múltiplos Campos em Feedback

Este guia documenta a inserção simultânea de quatro campos de tipos diferentes (`TEXT`, `FLOAT`, `INT`, `DATE`) na tabela que armazena os feedbacks dos pacientes (`PessoaTea_Atividade`).

A regra de ouro segue o fluxo: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Podemos adicionar múltiplas colunas em um único comando `ALTER TABLE` separando por vírgula.

**Onde posicionar:** Execute este comando diretamente no seu SGBD.

```sql
ALTER TABLE PessoaTea_Atividade
ADD COLUMN observacoes_gerais TEXT NULL,
ADD COLUMN pontuacao_extra FLOAT NULL DEFAULT 0.00,
ADD COLUMN tentativas INT NULL,
ADD COLUMN data_revisao DATE NULL;
```

---

## 🖥️ Passo 2: A Interface de Criação (HTML)

Adicionamos os 4 campos no modal onde o profissional digita o feedback.

**Onde posicionar:** No arquivo `view_atividade_profissional.html`, dentro do `<form id="feedbackForm">`.

```html
<div class="row g-3 mb-3">
    <div class="col-md-6">
        <label for="tentativas" class="form-label">Número de Tentativas</label>
        <input type="number" step="1" min="1" class="form-control" id="tentativas" name="tentativas" placeholder="Ex: 3">
    </div>

    <div class="col-md-6">
        <label for="pontuacao_extra" class="form-label">Pontuação Extra</label>
        <input type="number" step="0.01" class="form-control" id="pontuacao_extra" name="pontuacao_extra" placeholder="Ex: 1.50">
    </div>

    <div class="col-md-6">
        <label for="data_revisao" class="form-label">Data para Revisão</label>
        <input type="date" class="form-control" id="data_revisao" name="data_revisao">
    </div>

    <div class="col-12">
        <label for="observacoes_gerais" class="form-label">Observações Gerais</label>
        <textarea class="form-control" id="observacoes_gerais" name="observacoes_gerais" rows="3" placeholder="Anotações adicionais do profissional..."></textarea>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

O JavaScript precisa capturar todos os novos valores e anexar ao pacote `FormData`.

**Onde posicionar:** No arquivo `view_atividade_profissional.js`, no evento `submitFeedbackBtn.addEventListener('click')`.

```javascript
// 1. Captura os valores
const tentativas = document.getElementById('tentativas').value;
const pontuacaoExtra = document.getElementById('pontuacao_extra').value;
const dataRevisao = document.getElementById('data_revisao').value;
const obsGerais = document.getElementById('observacoes_gerais').value.trim();

// 2. Anexa ao FormData existente
const formData = new FormData();
// ... (seus appends antigos: id_atividade, feedback, etc) ...

// 3. ANEXA OS NOVOS CAMPOS
formData.append('tentativas', tentativas);
formData.append('pontuacao_extra', pontuacaoExtra);
formData.append('data_revisao', dataRevisao);
formData.append('observacoes_gerais', obsGerais);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

O backend recebe, formata a tipagem de cada variável por segurança, e injeta na query de `UPDATE`.

**Onde posicionar:** No arquivo `salvar_feedback.php`.

**Parte A: Captura (no topo do arquivo)**
```php
// Trata as variáveis forçando seus tipos exatos
$tentativas = !empty($_POST['tentativas']) ? (int) $_POST['tentativas'] : null;
$pontuacao_extra = !empty($_POST['pontuacao_extra']) ? (float) $_POST['pontuacao_extra'] : 0.00;
$data_revisao = !empty($_POST['data_revisao']) ? $_POST['data_revisao'] : null;
$observacoes_gerais = htmlspecialchars($_POST['observacoes_gerais'] ?? '', ENT_QUOTES, 'UTF-8');
```

**Parte B: Atualização no Banco**
```php
// 1. Atualizando a Query
$stmt = $conexao->prepare("
    UPDATE PessoaTea_Atividade
    SET feedback_profissional = ?,
        data_feedback = NOW(),
        status_conclusao = 'Avaliada',
        nota_feedback = ?,
        tentativas = ?,
        pontuacao_extra = ?,
        data_revisao = ?,
        observacoes_gerais = ?
    WHERE id_atividade = ? AND id_pessoa_tea = ?
");

// 2. Atualizando o bind_param
// s = feedback_profissional (String)
// s = nota_feedback (String)
// i = tentativas (Int)
// d = pontuacao_extra (Double/Float)
// s = data_revisao (Date é String no MySQL)
// s = observacoes_gerais (Text é String)
// i = id_atividade (Int)
// i = id_pessoa_tea (Int)
// Resultado: "ssidssii"
$stmt->bind_param("ssidssii", $feedback, $nota_feedback, $tentativas, $pontuacao_extra, $data_revisao, $observacoes_gerais, $id_atividade, $id_pessoa_tea);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

**Onde posicionar:** No arquivo `atividade_submissoes.php`, atualize a query `SELECT` da submissão.

```sql
SELECT 
    u.id_usuario, 
    u.nome, 
    pa.feedback_profissional, 
    pa.nota_feedback,
    pa.tentativas,
    pa.pontuacao_extra,
    pa.data_revisao,
    pa.observacoes_gerais
FROM PessoaTea_Atividade pa
JOIN Usuario u ON u.id_usuario = pa.id_pessoa_tea
WHERE pa.id_atividade = ?
```

---

## 🖥️ Passo 6: Exibindo na Tela (JavaScript)

Na hora de renderizar os cartões dos pacientes com as notas e comentários, o JS formata cada tipo de dado antes de injetar.

**Onde posicionar:** No arquivo `view_atividade_profissional.js`, na função `renderizarSubmissoes`.

```javascript
// Verifica e formata os dados
const tentHTML = sub.tentativas ? `<li><strong>Tentativas:</strong> ${sub.tentativas}</li>` : '';
const pontHTML = sub.pontuacao_extra ? `<li><strong>Bônus:</strong> +${parseFloat(sub.pontuacao_extra).toFixed(2).replace('.', ',')} pts</li>` : '';
const dataHTML = sub.data_revisao ? `<li><strong>Revisão em:</strong> ${new Date(sub.data_revisao + 'T00:00:00').toLocaleDateString('pt-BR')}</li>` : '';
const obsHTML  = sub.observacoes_gerais ? `<div class="mt-2 text-muted small"><i class="bi bi-info-circle"></i> Obs: ${sanitizarHTML(sub.observacoes_gerais)}</div>` : '';

// Injeta os blocos no HTML do Feedback Existente
const feedbackExistente = sub.feedback_profissional
    ? `
        <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 3px solid #16a34a;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;"><strong>Seu Feedback:</strong></p>
            
            <ul style="font-size: 0.85rem; margin-bottom: 10px; padding-left: 20px;">
                ${tentHTML}
                ${pontHTML}
                ${dataHTML}
            </ul>

            <p style="margin: 0; color: #1e293b;">${sanitizarHTML(sub.feedback_profissional)}</p>
            ${obsHTML}
        </div>
    `
    : '';
```