# 📖 Guia Definitivo: Super Combo (5 Campos) em Pessoa TEA

Este guia documenta a inserção simultânea de cinco novos campos (`VARCHAR`, `TEXT`, `DATE`, `INT`, `FLOAT`) na entidade **PessoaTea**, passando pela criação no banco de dados, formulário de cadastro, salvamento clínico no PHP e exibição rica na tabela JavaScript.

---

## 💾 Passo 1: O Banco de Dados (MySQL)

Adicionamos os novos campos na tabela do paciente.

**Onde posicionar:** Execute este comando diretamente no seu SGBD (phpMyAdmin, DBeaver, etc).

```sql
ALTER TABLE PessoaTea
ADD COLUMN escola_atual VARCHAR(150) NULL,
ADD COLUMN historico_medico TEXT NULL,
ADD COLUMN data_diagnostico DATE NULL,
ADD COLUMN horas_terapia_semanal INT NULL DEFAULT 0,
ADD COLUMN peso_atual_kg FLOAT(5,2) NULL DEFAULT 0.00;
```

---

## 🖥️ Passo 2: A Interface de Cadastro (HTML do Formulário)

Adicione os novos inputs no formulário de cadastro do paciente.

**Onde posicionar:** No arquivo de cadastro (ex: `cadastro_paciente.html`), dentro do `<form>`.

```html
<h5 class="mt-4 mb-3 text-primary border-bottom pb-2">Informações Clínicas e Escolares</h5>
<div class="row g-3 mb-4">
    <!-- 1. Campo VARCHAR (Escola Atual) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="text" class="form-control" id="escola_atual" name="escola_atual" placeholder="Ex: Escola Municipal Alegria" maxlength="150">
            <label for="escola_atual"><i class="bi bi-building me-2"></i> Escola / Instituição</label>
        </div>
    </div>

    <!-- 2. Campo FLOAT (Peso em KG) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="0.01" min="0" class="form-control" id="peso_atual_kg" name="peso_atual_kg" placeholder="Ex: 35.5">
            <label for="peso_atual_kg"><i class="bi bi-speedometer me-2"></i> Peso Atual (kg)</label>
        </div>
    </div>

    <!-- 3. Campo DATE (Data do Diagnóstico) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="date" class="form-control" id="data_diagnostico" name="data_diagnostico">
            <label for="data_diagnostico"><i class="bi bi-calendar-medical me-2"></i> Data do Diagnóstico</label>
        </div>
    </div>

    <!-- 4. Campo INT (Horas de Terapia Semanal) -->
    <div class="col-md-6">
        <div class="form-floating">
            <input type="number" step="1" min="0" class="form-control" id="horas_terapia_semanal" name="horas_terapia_semanal" placeholder="Ex: 10">
            <label for="horas_terapia_semanal"><i class="bi bi-clock-history me-2"></i> Horas de Terapia (Semanal)</label>
        </div>
    </div>

    <!-- 5. Campo TEXT (Histórico Médico) -->
    <div class="col-12">
        <div class="form-floating">
            <textarea class="form-control" id="historico_medico" name="historico_medico" style="height: 100px;" placeholder="Alergias, medicações..."></textarea>
            <label for="historico_medico"><i class="bi bi-clipboard2-pulse me-2"></i> Histórico Médico e Alergias</label>
        </div>
    </div>
</div>
```

---

## ⚙️ Passo 3: Captura e Envio (JavaScript)

*(Lembrete: Se o JS utilizar `new FormData(form)`, este passo é feito pelo navegador automaticamente. Se for envio manual com `.append`, utilize o código abaixo).*

```javascript
formData.append('escola_atual', document.getElementById('escola_atual').value.trim());
formData.append('historico_medico', document.getElementById('historico_medico').value.trim());
formData.append('data_diagnostico', document.getElementById('data_diagnostico').value);
formData.append('horas_terapia_semanal', document.getElementById('horas_terapia_semanal').value);
formData.append('peso_atual_kg', document.getElementById('peso_atual_kg').value);
```

---

## 🖧 Passo 4: Recebendo e Salvando (PHP)

Sanitização dos dados e conversão correta do peso (substituindo vírgula por ponto).

**Onde posicionar:** No arquivo `usuario_novo.php`.

**Parte A: Captura e Tratamento**
```php
$escola_atual = htmlspecialchars($_POST['escola_atual'] ?? '', ENT_QUOTES, 'UTF-8');
$historico_medico = htmlspecialchars($_POST['historico_medico'] ?? '', ENT_QUOTES, 'UTF-8');
$data_diagnostico = !empty($_POST['data_diagnostico']) ? $_POST['data_diagnostico'] : null;
$horas_terapia_semanal = !empty($_POST['horas_terapia_semanal']) ? (int) $_POST['horas_terapia_semanal'] : 0;

// Trata a vírgula do FLOAT (Peso)
$peso_bruto = !empty($_POST['peso_atual_kg']) ? $_POST['peso_atual_kg'] : '0';
$peso_atual_kg = (float) str_replace(',', '.', $peso_bruto);
```

**Parte B: Atualizando o INSERT do Paciente (PessoaTea)**
```php
// Localize o bloco `elseif ($tipo_usuario === 'PessoaTea') {`
$stmt_tea = $conexao->prepare("
    INSERT INTO PessoaTea (
        id_usuario, id_profissional, id_responsavel, observacao, nivel_tea,
        escola_atual, historico_medico, data_diagnostico, horas_terapia_semanal, peso_atual_kg
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

// Bind Param: 10 Variáveis
// Ordem: i(id_user), i(id_prof), i(id_resp), s(obs), s(nivel), s(escola), s(hist), s(data), i(horas), d(peso)
// Resultado rigoroso: "iiissssssid"
$stmt_tea->bind_param("iiisssssid", 
    $id_usuario, 
    $id_profissional_logado, 
    $id_responsavel_encontrado, 
    $observacao, 
    $nivel_tea,
    $escola_atual,
    $historico_medico,
    $data_diagnostico,
    $horas_terapia_semanal,
    $peso_atual_kg
);

$stmt_tea->execute();
$stmt_tea->close();
```

---

## 🖧 Passo 5: Buscando para Exibir (PHP)

Atualize a query para que a listagem consiga buscar os novos dados médicos.

**Onde posicionar:** No arquivo que busca os pacientes (ex: `pacientes_get.php`).

```sql
SELECT 
    U.id_usuario, U.nome, U.data_nascimento, 
    P.nivel_tea, P.observacao, 
    P.escola_atual, P.historico_medico, P.data_diagnostico, P.horas_terapia_semanal, P.peso_atual_kg
FROM Usuario U
INNER JOIN PessoaTea P ON U.id_usuario = P.id_usuario
WHERE U.tipo_usuario = 'PessoaTea'
```

---

## ⚙️ Passo 6: Exibição na Tabela Dinâmica (JavaScript)

Vamos gerar a tabela e formatar os dados com "tooltips" (balõezinhos) para não quebrar a tela com textos grandes.

**Onde posicionar:** No arquivo JS de listagem (ex: `listar_pacientes.js`), substituindo a função `preencherTabela`.

```javascript
function preencherTabela(dados) {
    if (!dados || dados.length === 0) {
        document.getElementById("lista").innerHTML = '<div class="text-center py-5 text-muted">Nenhum paciente cadastrado.</div>';
        return;
    }

    // Criando o cabeçalho
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3 ps-3">Paciente / Escola</th>
                    <th class="py-3 text-center">Nível TEA</th>
                    <th class="py-3">Diagnóstico</th>
                    <th class="py-3">Terapias (h/sem)</th>
                    <th class="py-3">Peso (kg)</th>
                    <th class="py-3">Histórico Médico</th>
                    <th class="py-3 text-end pe-3">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(paciente => {
        // 1. FLOAT (Peso)
        const pesoFloat = parseFloat(paciente.peso_atual_kg || 0);
        const pesoFormatado = pesoFloat > 0 ? `${pesoFloat.toFixed(2).replace('.', ',')} kg` : '--';

        // 2. DATE (Data formato BR)
        const dataFormatada = paciente.data_diagnostico 
            ? new Date(paciente.data_diagnostico + 'T00:00:00').toLocaleDateString('pt-BR') 
            : 'Não informado';

        // 3. INT (Horas)
        const horas = paciente.horas_terapia_semanal ? `${paciente.horas_terapia_semanal}h` : '--';

        // 4. TEXT (Histórico com limite de 30 caracteres para não quebrar o layout)
        const historicoCompleto = paciente.historico_medico || 'Sem registros médicos';
        const histResumido = historicoCompleto.length > 30 
            ? historicoCompleto.substring(0, 30) + '...' 
            : historicoCompleto;

        // Cor do Nível TEA (exemplo visual)
        let nivelBadge = "bg-secondary";
        if (paciente.nivel_tea === "1") nivelBadge = "bg-info text-dark";
        if (paciente.nivel_tea === "2") nivelBadge = "bg-warning text-dark";
        if (paciente.nivel_tea === "3") nivelBadge = "bg-danger";

        html += `
            <tr>
                <td class="ps-3 fw-bold">
                    ${paciente.nome}<br>
                    <small class="text-muted fw-normal"><i class="bi bi-building"></i> ${paciente.escola_atual || 'Escola não informada'}</small>
                </td>
                <td class="text-center">
                    <span class="badge ${nivelBadge} border">Nível ${paciente.nivel_tea || '?'}</span>
                </td>
                <td class="text-muted">${dataFormatada}</td>
                <td class="text-muted"><i class="bi bi-clock"></i> ${horas}</td>
                <td class="fw-semibold text-dark">${pesoFormatado}</td>
                
                <!-- O texto completo aparece no atributo "title" ao passar o mouse -->
                <td class="text-muted small" title="${historicoCompleto}">${histResumido}</td>
                
                <td class="text-end pe-3">
                    <div class="btn-group">
                        <a href="alterar_paciente.html?id=${paciente.id_usuario}" class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${paciente.id_usuario})" class="btn btn-sm btn-outline-danger border-0" title="Excluir">
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
