# 📖 Guia de Implementação: Novo Campo String (VARCHAR) em Feedbacks

Este guia documenta o passo a passo exato para adicionar um novo atributo de texto (String/VARCHAR) em um sistema existente. Utilizaremos como exemplo a adição de uma **`nota_feedback`** (ex: "Excelente", "10", "Aprovado") na tabela que liga o paciente à atividade.

A regra de ouro do Full-Stack é seguir o ciclo de vida do dado: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

O primeiro passo é preparar o banco para receber o novo dado. Como é um texto curto, usaremos `VARCHAR`.

**Onde posicionar:** Execute este comando diretamente no seu gerenciador de banco de dados (phpMyAdmin, DBeaver, etc.).

```sql
-- Adiciona a coluna permitindo valores nulos, para não quebrar registros antigos
ALTER TABLE PessoaTea_Atividade 
ADD COLUMN nota_feedback VARCHAR(50) NULL;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML)

O usuário precisa de um lugar para digitar essa informação. 

**Onde posicionar:** No arquivo `view_atividade_profissional.html`, dentro do `<form id="feedbackForm">`, logo abaixo do campo de texto (textarea) principal do feedback.

```html
<div class="mb-3">
    <label for="nota_feedback" class="form-label fw-bold">Nota da Atividade</label>
    <input type="text" class="form-control" id="nota_feedback" name="nota_feedback" placeholder="Ex: 10 ou Excelente" maxlength="50">
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

O JavaScript precisa capturar o valor digitado e empacotar para o servidor via `FormData`.

**Onde posicionar:** No arquivo `view_atividade_profissional.js`, dentro do evento `submitFeedbackBtn.addEventListener('click', ...)`, antes do bloco `try...catch` que faz o `fetch()`.

```javascript
// 1. Captura o valor digitado e limpa espaços extras com .trim()
const notaFeedback = document.getElementById('nota_feedback').value.trim();

// 2. Cria o pacote de envio (FormData) e anexa as variáveis já existentes
const formData = new FormData();
formData.append('id_atividade', idAtividade);
formData.append('id_pessoa_tea', currentFeedbackData.id_pessoa_tea);
formData.append('feedback', feedbackText.value);

// 3. ANEXA O NOVO CAMPO AQUI:
formData.append('nota_feedback', notaFeedback);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

O servidor recebe o dado, sanitiza contra ataques e atualiza o registro no banco. A ordem do `bind_param` é crítica e deve bater exatamente com a query.

**Onde posicionar:** No arquivo `salvar_feedback.php`.

**Parte A: Captura (no topo do arquivo, junto com os outros $_POST)**
```php
// Recebe o dado. Usamos null se estiver vazio para salvar um nulo real no banco
$nota_feedback = !empty($_POST['nota_feedback']) ? trim($_POST['nota_feedback']) : null;
```

**Parte B: Atualização no Banco (no bloco try, onde o UPDATE acontece)**
```php
// 1. Atualizando a Query (Atenção à ausência de vírgula na última linha do SET)
$stmt = $conexao->prepare("
    UPDATE PessoaTea_Atividade
    SET feedback_profissional = ?,
        data_feedback = NOW(),
        status_conclusao = 'Avaliada',
        nota_feedback = ? 
    WHERE id_atividade = ? AND id_pessoa_tea = ?
");

// 2. Atualizando o bind_param
// A ordem dos '?' acima é: feedback (String), nota (String), id_atividade (Inteiro), id_pessoa (Inteiro)
// Resultado do formato: "ssii"
$stmt->bind_param("ssii", $feedback, $nota_feedback, $id_atividade, $id_pessoa_tea);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Para o dado voltar para a tela após o recarregamento, o PHP de listagem precisa buscá-lo.

**Onde posicionar:** No arquivo `atividade_submissoes.php`, na query `SELECT` que busca as submissões.

```sql
-- Adicione a nova coluna (pa.nota_feedback) na lista do SELECT
SELECT 
    u.id_usuario, 
    pa.id_pessoa_tea, 
    u.nome, 
    pa.status_conclusao,
    pa.comentario_paciente,
    pa.data_conclusao,
    pa.feedback_profissional, 
    pa.data_feedback,
    pa.nota_feedback -- NOVO CAMPO ADICIONADO AQUI
FROM PessoaTea_Atividade pa
JOIN Usuario u ON u.id_usuario = pa.id_pessoa_tea
WHERE pa.id_atividade = ?
```

---

## 🖥️ Passo 6: Exibindo na Tela (JavaScript)

O último passo é pegar a variável que voltou do banco de dados e injetá-la no layout.

**Onde posicionar:** No arquivo `view_atividade_profissional.js`, dentro da função `renderizarSubmissoes`, antes de montar o `.innerHTML` do cartão.

```javascript
// 1. Sanitiza o valor para evitar injeção de HTML
const comentarioSanitizado = sanitizarHTML(sub.comentario_paciente);
const feedbackSanitizado = sanitizarHTML(sub.feedback_profissional);

// 2. Monta o bloco HTML da nota (só exibe se houver nota)
const notaHTML = sub.nota_feedback 
    ? `<p style="font-size: 0.9rem; color: #1e293b; margin-bottom: 0.5rem;"><strong>Nota da Atividade:</strong> <span class="badge bg-primary">${sanitizarHTML(sub.nota_feedback)}</span></p>` 
    : '';

// 3. Injeta a nota dentro da caixa de feedback existente
const feedbackExistente = sub.feedback_profissional
    ? `
        <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 3px solid #16a34a;">
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;"><strong>Seu Feedback:</strong></p>
            
            ${notaHTML} <p style="margin: 0; color: #1e293b;">${feedbackSanitizado}</p>
            <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">
                Enviado em ${new Date(sub.data_feedback).toLocaleDateString('pt-BR')}
            </p>
        </div>
    `
    : '';
```