# 📖 Guia de Implementação: Novo Campo Inteiro (INT)

Este guia documenta o ciclo de vida completo para a inserção de um novo atributo numérico inteiro (`INT`) na entidade **Documentacao**. Utilizaremos a adição do campo **`ano_emissao`** (Ano de Emissão do documento) como exemplo, integrando-o diretamente à tela de **Gestão de Profissionais**.

A regra de ouro segue o fluxo: **Banco de Dados -> HTML -> JavaScript -> PHP**.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Campos numéricos exatos, sem casas decimais, usam o tipo `INT`.

**Onde posicionar:** Execute este comando diretamente no seu gerenciador de banco de dados.

```sql
-- Adiciona a coluna permitindo valores nulos, caso o profissional ainda não tenha enviado
ALTER TABLE Documentacao 
ADD COLUMN ano_emissao INT NULL;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML)

Onde o profissional se cadastra (`cadastro_profissional.html`), precisamos do campo para ele digitar o ano.

**Onde posicionar:** Dentro da tag `<form>`, logo acima do campo de Senha.

```html
<div class="col-md-6 mb-3">
    <label for="ano_emissao" class="form-label fw-bold text-muted small text-uppercase">
        <i class="bi bi-calendar-date me-1"></i> Ano de Emissão
    </label>
    <input type="number" class="form-control rounded-3" id="ano_emissao" name="ano_emissao" placeholder="Ex: 2021" min="1900" max="2026" step="1">
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

Quando o profissional clica em "Enviar Solicitação", o JS captura o número digitado.

**Onde posicionar:** No arquivo `profissional_novo.js`, dentro de `formulario.addEventListener('submit', ...)`, junto aos outros `.append()`.

```javascript
// O JS captura o dado pelo ID e anexa ao pacote de envio (FormData)
formData.append('ano_emissao', document.getElementById('ano_emissao').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

O backend recebe o dado e força a tipagem para inteiro (`int`) por segurança antes de gravar no banco.

**Onde posicionar:** No arquivo `usuario_novo.php` (na parte de processamento back-end, onde você faz o INSERT da Documentação).

```php
// 1. Captura a variável e converte estritamente para (int)
$ano_emissao = !empty($_POST['ano_emissao']) ? (int) $_POST['ano_emissao'] : null;

// 2. Na query de inserção, adicione a variável com a letra 'i' (Inteiro) no bind_param
$stmt_doc = $conexao->prepare("INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, ano_emissao) VALUES (?, ?, ?, ?)");

// As letras formatadoras: 'i' (Inteiro ID), 's' (String/Blob cert), 's' (String/Blob iden), 'i' (Inteiro ano) = "issi"
$stmt_doc->bind_param("issi", $id_usuario, $certificacao_conteudo, $identidade_conteudo, $ano_emissao);
$stmt_doc->execute();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP do Administrador)

**⚠️ CORREÇÃO CRÍTICA DE BUG:** Para que o ano apareça na tabela, o PHP de listagem precisa buscar a coluna no banco. Se omitir isso, a tela exibirá "--".

**Onde posicionar:** No arquivo `listar-profissionais.php`. 

```php
// No bloco 'else' (linha 32), substitua a query $sql por esta versão que busca o ano_emissao:
$sql = "SELECT 
            U.id_usuario, U.nome, U.email, U.cpf, 
            P.especialidade, P.registro_profissional,
            (SELECT D.status_aprovacao FROM Documentacao D WHERE D.id_usuario = U.id_usuario ORDER BY D.data_envio DESC LIMIT 1) as status_aprovacao,
            (SELECT D.ano_emissao FROM Documentacao D WHERE D.id_usuario = U.id_usuario ORDER BY D.data_envio DESC LIMIT 1) as ano_emissao
        FROM Usuario U
        INNER JOIN ProfissionalSaude P ON U.id_usuario = P.id_usuario
        WHERE U.tipo_usuario = 'ProfissionalSaude'
        ORDER BY U.nome ASC";
```

---

## 🖥️ Passo 6: Exibindo na Tela (JavaScript do Administrador)

Injetamos a coluna "Ano Emissão" e os dados correspondentes diretamente no HTML gerado pela tabela.

**Onde posicionar:** No arquivo `listar-profissionais.js`, dentro da função `preencherTabela(dados)`.

```javascript
function preencherTabela(dados) {
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3">Nome</th>
                    <th class="py-3">Especialidade</th>
                    <th class="py-3">CRP/CRM</th>
                    <th class="py-3">Ano Emissão</th> <th class="py-3">Status Doc.</th>
                    <th class="py-3 text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(prof => {
        let statusColor = "text-bg-secondary";
        let statusTexto = prof.status_aprovacao || "Sem envio";

        if (prof.status_aprovacao === "Aprovado") statusColor = "text-bg-success";
        else if (prof.status_aprovacao === "Aguardando") statusColor = "text-bg-warning";
        else if (prof.status_aprovacao === "Reprovado") statusColor = "text-bg-danger";

        // Verifica se o ano veio do banco. Se veio nulo/vazio, imprime "--"
        let anoTexto = prof.ano_emissao ? prof.ano_emissao : "--";

        html += `
            <tr>
                <td class="fw-bold">
                    ${prof.nome}<br>
                    <small class="text-muted fw-normal">${prof.email}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${prof.especialidade}</span></td>
                <td class="text-muted">${prof.registro_profissional}</td>
                
                <td class="text-muted fw-semibold">${anoTexto}</td> <td><span class="badge ${statusColor}">${statusTexto}</span></td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='analisar_documentacao.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-info border-0" title="Analisar Documentos">
                            <i class="bi bi-file-earmark-medical"></i>
                        </a>
                        <a href='../profissional/alterar_profissional.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${prof.id_usuario})" class="btn btn-sm btn-outline-danger border-0">
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