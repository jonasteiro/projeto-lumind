# 📖 Guia de Implementação: Novo Campo Longo (TEXT) em Relatórios

Este guia documenta a implementação ponta a ponta de um novo atributo de texto longo (`TEXT`) no sistema. Utilizaremos como exemplo a adição do campo **`observacoes_extras`** na entidade **Relatorio**.

O fluxo completo segue a arquitetura: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

O tipo `TEXT` é ideal para textos longos, pois não possui um limite de caracteres tão restrito quanto o `VARCHAR(100)`.

**Onde posicionar:** Execute no seu gerenciador de banco de dados.

```sql
-- Adiciona a coluna permitindo valores nulos (opcional para o usuário preencher)
ALTER TABLE Relatorio 
ADD COLUMN observacoes_extras TEXT NULL;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML)

Para textos longos, a tag HTML correta é o `<textarea>`, que permite ao usuário digitar múltiplas linhas e redimensionar a caixa.

**Onde posicionar:** No arquivo de criação do relatório (ex: `relatorio_responsavel.html`), dentro do formulário `<form>`, preferencialmente abaixo do campo de descrição principal.

```html
<div class="mb-4">
    <label for="observacoes_extras" class="form-label fw-bold text-muted small text-uppercase">
        <i class="bi bi-journal-plus me-1"></i> Observações Extras (Opcional)
    </label>
    <textarea class="form-control rounded-3 border-light-subtle" id="observacoes_extras" name="observacoes_extras" rows="4" placeholder="Adicione qualquer detalhe adicional aqui..."></textarea>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

Precisamos capturar o texto dessa nova caixa e enviá-lo junto com os dados que já existiam (data, descrição, preço).

**Onde posicionar:** No arquivo JS responsável por salvar o relatório (ex: `relatorio_novo.js`), dentro do evento de `submit` ou botão de salvar.

```javascript
// 1. Captura o valor digitado e limpa espaços extras nas extremidades com .trim()
const observacoesExtras = document.getElementById('observacoes_extras').value.trim();

// 2. Adiciona ao pacote FormData que já contém os outros dados
const formData = new FormData();
// ... (seus appends anteriores: id_pessoa_tea, data, descricao, preco, etc.)

// 3. ANEXA O NOVO CAMPO AQUI:
formData.append('observacoes_extras', observacoesExtras);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Como o usuário tem liberdade para digitar muitas coisas (incluindo quebras de linha e caracteres especiais), a sanitização é **obrigatória** antes de tocar no banco de dados.

**Onde posicionar:** No arquivo PHP que recebe o `POST` para salvar (ex: `relatorio_salvar.php`).

**Parte A: Captura e Sanitização (no topo do arquivo)**
```php
// Usa htmlspecialchars para neutralizar tags HTML/JS maliciosas. 
// O tipo TEXT usa a mesma regra de sanitização de uma String normal.
$observacoes_extras = htmlspecialchars($_POST['observacoes_extras'] ?? '', ENT_QUOTES, 'UTF-8');
```

**Parte B: Inserção no Banco (na query INSERT)**
```php
// 1. Atualiza a Query adicionando a coluna e mais uma interrogação '?'
$sql = "INSERT INTO Relatorio (id_responsavel, id_pessoa_tea, data, descricao, preco, observacoes_extras) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conexao->prepare($sql);

// 2. Atualiza o bind_param
// Lembrete da ordem hipotética: 
// id_responsavel (i) + id_pessoa (i) + data (s) + descricao (s) + preco (d) + observacoes_extras (s)
// Resultado: "iissds" (O 's' no final é a nossa nova variável TEXT)
$stmt->bind_param("iissds", $id_responsavel, $id_pessoa_tea, $data, $descricao, $preco, $observacoes_extras);

$stmt->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Para que o modal de detalhes do relatório consiga exibir essa anotação no futuro, precisamos buscá-la.

**Onde posicionar:** No arquivo PHP que lista os relatórios (ex: `relatorios_listar.php`).

```sql
-- Adicione a nova coluna na lista do SELECT
SELECT 
    id_relatorio, 
    data, 
    descricao, 
    preco, 
    observacoes_extras -- NOVO CAMPO ADICIONADO AQUI
FROM Relatorio 
WHERE id_responsavel = ?
ORDER BY data DESC
```

---

## 🖥️ Passo 6: Exibindo no Modal (JavaScript)

Por fim, pegamos a variável que chegou do banco e a injetamos no HTML do Modal de visualização.

**Onde posicionar:** 1. No HTML do Modal (`lista_relatorios.html`), crie um espaço vazio para receber o texto: `<div id="modal-observacoes"></div>`.
2. No JS (`lista_relatorios.js`), dentro da função `abrirModal`.

```javascript
// Dentro da função window.abrirModal = function(rel) { ... }

// Verifica se o campo veio preenchido do banco de dados
const observacoesHTML = rel.observacoes_extras 
    ? `<div class="mt-3 p-3 bg-light border rounded">
         <h6 class="text-muted small fw-bold text-uppercase"><i class="bi bi-info-circle me-1"></i> Observações Extras</h6>
         <p class="mb-0 text-dark" style="white-space: pre-wrap;">${rel.observacoes_extras}</p>
       </div>`
    : ''; // Se for vazio/nulo, não renderiza nada

// Injeta no modal (supondo que você criou um espaço com id="modal-observacoes" no HTML)
const containerObservacoes = document.getElementById('modal-observacoes');
if (containerObservacoes) {
    containerObservacoes.innerHTML = observacoesHTML;
}
```