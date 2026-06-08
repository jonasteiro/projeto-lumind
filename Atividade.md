# 📖 Guia de Implementação: Novo Campo de Data (DATE) em Atividades

Este guia documenta a inserção do campo **`data_limite`** (Prazo de Entrega) na entidade **Atividade**. 

**NOTA IMPORTANTE:** Como a tela de `publicar_atividade.html` utiliza o construtor `new FormData(form)`, a captura no JavaScript acontece **automaticamente**, baseada no atributo `name` do HTML. Portanto, não é necessário modificar o arquivo JS de envio, apenas o HTML e o PHP.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Campos que armazenam dias, meses e anos utilizam o tipo `DATE` (formato padrão do banco: `YYYY-MM-DD`).

**Onde posicionar:** Execute este comando diretamente no seu SGBD (phpMyAdmin).

```sql
-- Adiciona a coluna permitindo valores nulos, caso a atividade não tenha um prazo
ALTER TABLE Atividade 
ADD COLUMN data_limite DATE NULL;
```

---

## 🖥️ Passo 2: A Interface de Criação (HTML)

Adicionamos o campo no formulário de publicar a atividade. Como você usa a captura automática no JS, a tag `name="data_limite"` é quem faz a ponte.

**Onde posicionar:** No arquivo `publicar_atividade.html`, dentro de `<form id="formPublicarAtividade">`, logo abaixo do campo Descrição.

```html
<div class="mb-3">
    <label for="data_limite" class="form-label fw-bold text-muted small text-uppercase">
        <i class="bi bi-calendar-x me-1"></i> Prazo de Entrega (Opcional)
    </label>
    <input type="date" class="form-control rounded-3" id="data_limite" name="data_limite">
</div>
```
*(Não precisa mexer no arquivo `publicar_atividade.js`. A linha `const formData = new FormData(form);` já vai pegar esse input novo automaticamente!)*

---

## 🖧 Passo 3: Recebendo e Salvando (PHP)

O backend recebe a string da data limite e a salva no banco de dados.

**Onde posicionar:** No arquivo **`php/atividades/criar_atividade.php`**.

```php
// 1. Captura a variável. Se vier vazia, transformamos em null para o banco de dados.
$data_limite = !empty($_POST['data_limite']) ? $_POST['data_limite'] : null;

// 2. Atualiza a query de inserção. (Atenção para adicionar a coluna ANTES de 'arquivo_anexo' caso queira seguir a ordem, ou no final)
// Exemplo colocando no final:
$sql_insert = "INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria, arquivo_anexo, tipo_arquivo, data_limite) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                   
$stmt = $conexao->prepare($sql_insert);

if (!$stmt) {
    throw new Exception("Erro interno do Banco de Dados: " . $conexao->error);
}

// 3. Atualiza o bind_param. Adicionamos a letra 's' (String) no final correspondente ao data_limite.
// Resultado final da string: "isssssss"
$stmt->bind_param("isssssss", $id_profissional, $titulo, $descricao, $data_publicacao, $categoria, $arquivo_binario, $tipo_arquivo, $data_limite);
$stmt->execute();
```

---

## 🖧 Passo 4: Buscando para Exibir (PHP)

Para exibir esse prazo na tela de detalhes, o PHP precisa puxá-lo do banco e devolver no JSON.

**Onde posicionar:** No arquivo **`php/atividades/atividade_submissoes.php`**.

```sql
-- Atualize a query do check da atividade para incluir a data_limite no SELECT (linha ~31)
$check = $conexao->prepare("
    SELECT id_atividade, titulo, descricao, categoria, data_publicacao, data_limite, tipo_arquivo, TO_BASE64(arquivo_anexo) AS arquivo_anexo 
    FROM Atividade 
    WHERE id_atividade = ? AND id_profissional = ? 
    LIMIT 1
");
```

---

## 🖥️ Passo 5: Exibindo na Tela (JavaScript)

Na tela onde você vê os detalhes da atividade (e dá o feedback), o JS formata a data para o padrão Brasileiro e a mostra na tela.

**Onde posicionar:** 1. Crie o espaço no seu **`view_atividade_profissional.html`**, dentro da `<div class="activity-header">`:
```html
<div class="activity-header">
    <span class="badge-categoria" id="categoria-atividade">Categoria</span>
    <span class="activity-meta" id="data-atividade">Data</span>
    <span class="activity-meta text-danger fw-bold ms-2" id="prazo-atividade"></span>
</div>
```

2. Atualize o arquivo **`view_atividade_profissional.js`**, injetando a lógica de exibição no final da função `renderizarAtividade(atividade)`:
```javascript
function renderizarAtividade(atividade) {
    // ... [código que já existe: titulo, categoria, descricao, data_publicacao] ...

    // NOVO: Lógica de Exibição do Prazo
    const prazoElement = document.getElementById('prazo-atividade');
    if (prazoElement) {
        if (atividade.data_limite && atividade.data_limite !== '0000-00-00') {
            // Formata YYYY-MM-DD para DD/MM/YYYY. O T00:00:00 impede bug de fuso horário.
            const prazoFormatado = new Date(atividade.data_limite + 'T00:00:00').toLocaleDateString('pt-BR');
            prazoElement.innerHTML = `<i class="bi bi-clock-history"></i> Prazo: ${prazoFormatado}`;
        } else {
            // Se for null, deixa oculto ou escreve "Sem prazo"
            prazoElement.innerHTML = `<i class="bi bi-calendar-check text-muted"></i> <span class="text-muted">Sem prazo definido</span>`;
        }
    }

    // ... [código que já existe: arquivo_anexo] ...
}
```