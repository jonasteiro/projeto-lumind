# GUIA RIGOROSO — Adição de 5 Campos em Cada CRUD (Lumind)

## ANTES DE TUDO — Adicione as colunas no banco de dados

Execute este SQL no seu banco `lumind_db` **antes de qualquer alteração nos arquivos**. Cada bloco abaixo corresponde a uma CRUD.

```sql
-- ==============================
-- ATIVIDADE
-- ==============================
ALTER TABLE Atividade
    ADD COLUMN observacao_extra TEXT NULL,
    ADD COLUMN nivel_dificuldade INT NULL,
    ADD COLUMN pontuacao_maxima FLOAT NULL,
    ADD COLUMN codigo_atividade VARCHAR(30) NULL,
    ADD COLUMN data_limite DATE NULL;

-- ==============================
-- RELATORIO
-- ==============================
ALTER TABLE Relatorio
    ADD COLUMN observacao_adicional TEXT NULL,
    ADD COLUMN intensidade INT NULL,
    ADD COLUMN duracao_horas FLOAT NULL,
    ADD COLUMN local_evento VARCHAR(100) NULL,
    ADD COLUMN data_ocorrencia DATE NULL;

-- ==============================
-- PROFISSIONAL (tabela ProfissionalSaude)
-- ==============================
ALTER TABLE ProfissionalSaude
    ADD COLUMN biografia TEXT NULL,
    ADD COLUMN anos_experiencia INT NULL,
    ADD COLUMN valor_consulta FLOAT NULL,
    ADD COLUMN area_atuacao VARCHAR(80) NULL,
    ADD COLUMN data_inicio_clinica DATE NULL;

-- ==============================
-- RESPONSAVEL (tabela ResponsavelLegal via Usuario)
-- ==============================
ALTER TABLE Usuario
    ADD COLUMN observacao_responsavel TEXT NULL,
    ADD COLUMN num_dependentes INT NULL,
    ADD COLUMN renda_familiar FLOAT NULL,
    ADD COLUMN parentesco VARCHAR(50) NULL,
    ADD COLUMN data_vinculo DATE NULL;

-- ==============================
-- ADMIN (tabela Administrador via Usuario)
-- ==============================
-- (Os campos do Admin ficam na tabela Usuario, 
--  já que o cadastro Admin usa usuario_novo.php → INSERT INTO Usuario)
-- Os campos de Usuario acima (observacao_responsavel etc.) já existem,
-- então crie colunas DISTINTAS para Admin:
ALTER TABLE Administrador
    ADD COLUMN bio_admin TEXT NULL,
    ADD COLUMN nivel_acesso INT NULL,
    ADD COLUMN percentual_meta FLOAT NULL,
    ADD COLUMN setor VARCHAR(60) NULL,
    ADD COLUMN data_posse DATE NULL;

-- ==============================
-- FEEDBACK (tabela PessoaTea_Atividade)
-- ==============================
ALTER TABLE PessoaTea_Atividade
    ADD COLUMN nota_feedback TEXT NULL,
    ADD COLUMN tentativas INT NULL,
    ADD COLUMN percentual_acerto FLOAT NULL,
    ADD COLUMN tag_feedback VARCHAR(50) NULL,
    ADD COLUMN data_prevista_retorno DATE NULL;


-- ==============================
-- PESSOA TEA(tabela PessoaTea)
-- ==============================
ALTER TABLE PessoaTea
    ADD COLUMN anotacao_clinica      TEXT         NULL,
    ADD COLUMN idade_diagnostico     INT          NULL,
    ADD COLUMN indice_desenvolvimento FLOAT       NULL,
    ADD COLUMN codigo_paciente       VARCHAR(30)  NULL,
    ADD COLUMN data_ingresso         DATE         NULL;
---

# CRUD 1 — ATIVIDADE

**Arquivos que você vai mexer:**
- `php/criar_atividade.php`
- `php/atividades_get.php`
- `home/publicar_atividade.html`
- `js/publicar_atividade.js`
- `js/painel_atividades.js`

## PASSO 1.1 — HTML do formulário de criação
**Arquivo:** `home/publicar_atividade.html`

**ONDE ADICIONAR:** Depois da linha que contém `</div>` fechando o bloco do arquivo de upload (o bloco do "Material de Apoio"). Antes do bloco `mb-4` que mostra "Selecionar Pacientes".

**Procure este trecho (aproximadamente linha 100):**
```html
                        <div class="mb-4">
                            <label class="d-block mb-2 text-dark fw-bold" style="font-size: 0.9rem;">
                                <i class="bi bi-people me-2"></i> Selecionar Pacientes *
```

**ADICIONE ANTES desse trecho (antes do `<div class="mb-4">` dos pacientes):**
```html
                        <!-- ====================================================
                             CAMPOS NOVOS — ATIVIDADE (Autoria)
                             CAMPO 1: TEXT — observacao_extra
                             Aceita texto longo livre. O <textarea> é a tag certa
                             para TYPE=TEXT do banco.
                        ==================================================== -->
                        <div class="form-floating mb-3">
                            <textarea id="observacao_extra"
                                      name="observacao_extra"
                                      class="form-control rounded-3 border-light-subtle"
                                      placeholder="Observação"
                                      style="height: 100px;"></textarea>
                            <label for="observacao_extra" class="text-muted">
                                <i class="bi bi-journal-text me-2"></i> Observação Extra (TEXT)
                            </label>
                        </div>

                        <!-- CAMPO 2: INT — nivel_dificuldade
                             type="number" com step="1" garante valor inteiro.
                             min="1" max="5" define o intervalo válido. -->
                        <div class="form-floating mb-3">
                            <input type="number"
                                   id="nivel_dificuldade"
                                   name="nivel_dificuldade"
                                   class="form-control rounded-3 border-light-subtle"
                                   placeholder="Nível"
                                   min="1" max="5" step="1" />
                            <label for="nivel_dificuldade" class="text-muted">
                                <i class="bi bi-bar-chart me-2"></i> Nível de Dificuldade 1-5 (INT)
                            </label>
                        </div>

                        <!-- CAMPO 3: FLOAT — pontuacao_maxima
                             step="0.1" permite valores decimais (ex: 9.5). -->
                        <div class="form-floating mb-3">
                            <input type="number"
                                   id="pontuacao_maxima"
                                   name="pontuacao_maxima"
                                   class="form-control rounded-3 border-light-subtle"
                                   placeholder="Pontuação"
                                   min="0" step="0.1" />
                            <label for="pontuacao_maxima" class="text-muted">
                                <i class="bi bi-star me-2"></i> Pontuação Máxima (FLOAT)
                            </label>
                        </div>

                        <!-- CAMPO 4: VARCHAR(30) — codigo_atividade
                             maxlength="30" limita ao tamanho da coluna no banco. -->
                        <div class="form-floating mb-3">
                            <input type="text"
                                   id="codigo_atividade"
                                   name="codigo_atividade"
                                   class="form-control rounded-3 border-light-subtle"
                                   placeholder="Código"
                                   maxlength="30" />
                            <label for="codigo_atividade" class="text-muted">
                                <i class="bi bi-upc me-2"></i> Código da Atividade (VARCHAR 30)
                            </label>
                        </div>

                        <!-- CAMPO 5: DATE — data_limite
                             type="date" mapeia direto para o tipo DATE do MySQL. -->
                        <div class="form-floating mb-3">
                            <input type="date"
                                   id="data_limite"
                                   name="data_limite"
                                   class="form-control rounded-3 border-light-subtle"
                                   placeholder="Data Limite" />
                            <label for="data_limite" class="text-muted">
                                <i class="bi bi-calendar-x me-2"></i> Data Limite (DATE)
                            </label>
                        </div>
                        <!-- FIM DOS CAMPOS NOVOS — ATIVIDADE -->
```

## PASSO 1.2 — PHP de criação
**Arquivo:** `php/criar_atividade.php`

**ONDE MEXER:** Há dois pontos neste arquivo.

**PONTO A — Captura dos dados POST.**
Procure este bloco (aproximadamente linha 22):
```php
    $titulo = $_POST['titulo'];
    $descricao = $_POST['descricao'];
    $categoria = $_POST['categoria'];
    $data_publicacao = $_POST['data_publicacao'];
    $pacientes_ids = $_POST['pacientes_ids'];
```

**ADICIONE LOGO ABAIXO das linhas acima:**
```php
    // =====================================================
    // CAMPOS NOVOS — ATIVIDADE (captura do POST)
    // ?? operador garante que se o campo vier vazio do form,
    // o PHP usa NULL em vez de erro.
    // =====================================================
    
    // CAMPO TEXT: observacao_extra — texto longo livre
    $observacao_extra = $_POST['observacao_extra'] ?? null;
    
    // CAMPO INT: nivel_dificuldade — converte para inteiro
    // intval() transforma string "3" em número 3
    $nivel_dificuldade = isset($_POST['nivel_dificuldade']) && $_POST['nivel_dificuldade'] !== ''
                         ? intval($_POST['nivel_dificuldade']) : null;
    
    // CAMPO FLOAT: pontuacao_maxima — converte para decimal
    // floatval() transforma "9.5" em 9.5
    $pontuacao_maxima = isset($_POST['pontuacao_maxima']) && $_POST['pontuacao_maxima'] !== ''
                        ? floatval($_POST['pontuacao_maxima']) : null;
    
    // CAMPO VARCHAR: codigo_atividade — texto curto, máx 30 chars
    $codigo_atividade = $_POST['codigo_atividade'] ?? null;
    
    // CAMPO DATE: data_limite — string no formato Y-m-d (ex: 2025-12-31)
    $data_limite = $_POST['data_limite'] ?? null;
```

**PONTO B — Query SQL de INSERT.**
Procure esta linha (aproximadamente linha 35):
```php
    $sql_insert = "INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria, arquivo_anexo, tipo_arquivo) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)";
```

**SUBSTITUA ela por:**
```php
    // =====================================================
    // CAMPOS NOVOS incluídos no INSERT
    // Adicionamos os campos novos ao final da lista
    // de colunas e ao final dos placeholders (?)
    // =====================================================
    $sql_insert = "INSERT INTO Atividade 
                       (id_profissional, titulo, descricao, data_publicacao, categoria, 
                        arquivo_anexo, tipo_arquivo,
                        observacao_extra, nivel_dificuldade, pontuacao_maxima, 
                        codigo_atividade, data_limite) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
```

Agora procure a linha do `bind_param` logo abaixo:
```php
    $stmt->bind_param("issssss", $id_profissional, $titulo, $descricao, $data_publicacao, $categoria, $arquivo_binario, $tipo_arquivo);
```

**SUBSTITUA por:**
```php
    // =====================================================
    // bind_param atualizado com os campos novos:
    // Legenda de tipos:
    //   i = (INT)
    //   s = (TEXT, VARCHAR, DATE — todos vão como string)
    //   d = (FLOAT)
    // Ordem dos ? no SQL acima deve bater com a ordem aqui:
    // 1=i id_profissional | 2=s titulo | 3=s descricao
    // 4=s data_publicacao  | 5=s categoria | 6=s arquivo_binario
    // 7=s tipo_arquivo
    // NOVOS: 8=s observacao_extra | 9=i nivel_dificuldade
    //        10=d pontuacao_maxima | 11=s codigo_atividade
    //        12=s data_limite
    // =====================================================
    $stmt->bind_param("isssssssids",
        $id_profissional,   // 1 — i (INT)
        $titulo,            // 2 — s (VARCHAR)
        $descricao,         // 3 — s (TEXT)
        $data_publicacao,   // 4 — s (DATE)
        $categoria,         // 5 — s (VARCHAR)
        $arquivo_binario,   // 6 — s (BLOB)
        $tipo_arquivo,      // 7 — s (VARCHAR)
        $observacao_extra,  // 8 — s (TEXT) — CAMPO NOVO
        $nivel_dificuldade, // 9 — i (INT)  — CAMPO NOVO
        $pontuacao_maxima,  // 10— d (FLOAT)— CAMPO NOVO
        $codigo_atividade,  // 11— s (VARCHAR)—CAMPO NOVO
        $data_limite        // 12— s (DATE) — CAMPO NOVO
    );
```

---

## PASSO 1.3 — PHP de listagem
**Arquivo:** `php/atividades_get.php`

**ONDE MEXER:** Nas 3 queries SQL (profissional, responsável e pessoaTea). Você vai adicionar o campos novo no `SELECT` de cada uma.

**Para o bloco do Profissional**, procure:
```sql
                a.id_atividade,
                a.titulo,
                a.categoria,
                a.data_publicacao,
```

**ADICIONE os campos novos logo após `a.data_publicacao,`** (dentro do SELECT, antes do `FROM`):
```sql
                a.id_atividade,
                a.titulo,
                a.categoria,
                a.data_publicacao,
                -- CAMPOS NOVOS ATIVIDADE --
                a.observacao_extra,      -- TEXT
                a.nivel_dificuldade,     -- INT
                a.pontuacao_maxima,      -- FLOAT
                a.codigo_atividade,      -- VARCHAR
                a.data_limite,           -- DATE
```

Faça o mesmo nos outros dois blocos (ResponsavelLegal e PessoaTea) — em ambos há um `SELECT` com `a.id_atividade, a.titulo, a.categoria, a.data_publicacao`. Adicione as mesmas linhas após `a.data_publicacao,` em cada bloco.


## PASSO 1.4 — JS de listagem (painel_atividades.js)
**Arquivo:** `js/painel_atividades.js`

**ONDE MEXER:** Na função que monta o HTML dos cards/linhas de atividade. Procure onde aparece `a.titulo` ou `atividade.titulo` sendo inserido no HTML.

**Dica de localização:** procure por `container.innerHTML +=` ou por onde está o `template literal` `` ` `` que monta o card. Os campos abaixo ficam dentro desse template.

**ADICIONE no HTML do card, após onde exibe `data_publicacao`:**
```javascript
// =====================================================
// CAMPOS NOVOS exibidos no card de atividade
// Os dados já chegam no objeto via atividades_get.php
// Basta referenciar as propriedades pelo nome da coluna
// =====================================================

// Dentro do template literal do card, adicione:

//TEXT
${atv.observacao_extra ? `<span class="badge bg-secondary">Obs: ${atv.observacao_extra}</span>` : ''}
//INT
${atv.nivel_dificuldade ? `<span class="badge bg-secondary">Dificuldade: ${atv.nivel_dificuldade}/5</span>` : ''}
//FLOAT
${atv.pontuacao_maxima ? `<span class="badge bg-secondary">Pontuação máx.: ${atv.pontuacao_maxima}</span>` : ''}
//VARCHAR
${atv.codigo_atividade ? `<span class="badge bg-secondary">Código: ${atv.codigo_atividade}</span>` : ''}
//DATE
${atv.data_limite ? `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Prazo: ${new Date(atv.data_limite + 'T00:00:00').toLocaleDateString('pt-BR')}</span>` : ''}

# CRUD 2 — RELATÓRIO

**Arquivos que você vai mexer:**
- `home/relatorio_responsavel.html` (formulário de criação — responsável)
- `home/listar_relatorios_responsavel.html`(formulário de Listagem — responsável)
- `js/responsavel/relatorio.js` (envio do formulário)
- `php/responsavel/relatorio_salvar.php` (PHP que salva)
- `php/responsavel/relatorios_listar.php` (PHP que lista para responsável)
- `php/profissional/relatorios_listar.php` (PHP que lista para profissional)
- `js/responsavel/lista_relatorios.js` (exibição dos cards — responsável)
- `js/profissional/lista_relatorios.js` (exibição dos cards — profissional)

---

## PASSO 2.1 — HTML do formulário de criação
**Arquivo:** `home/relatorio_responsavel.html`

**ONDE ADICIONAR:** Após o `</textarea>` do campo de descrição (aproximadamente linha 114), antes do botão de salvar.

**Procure:**
```html
                                          required></textarea>
```

**ADICIONE LOGO ABAIXO (antes do botão salvar / div de ações):**
```html
                                <!-- ============================================
                                     CAMPOS NOVOS — RELATÓRIO (Autoria)
                                     CAMPO 1: TEXT — observacao_adicional
                                ============================================ -->
                                <div class="mt-4">
                                    <label for="observacao_adicional"
                                           class="form-label fw-bold text-muted small text-uppercase">
                                        <i class="bi bi-journal-plus me-1"></i>
                                        Observação Adicional (TEXT)
                                    </label>
                                    <textarea id="observacao_adicional"
                                              class="form-control rounded-3 border-light-subtle bg-light text-dark p-3"
                                              rows="3"
                                              placeholder="Informações extras sobre o evento..."></textarea>
                                </div>

                                <!-- CAMPO 2: INT — intensidade
                                     Número de 1 a 10 indicando intensidade do comportamento -->
                                <div class="mt-3">
                                    <label for="intensidade"
                                           class="form-label fw-bold text-muted small text-uppercase">
                                        <i class="bi bi-activity me-1"></i>
                                        Intensidade do Comportamento 1-10 (INT)
                                    </label>
                                    <input type="number"
                                           id="intensidade"
                                           class="form-control form-control-lg rounded-3 border-light-subtle bg-light text-dark"
                                           min="1" max="10" step="1"
                                           placeholder="Ex: 7" />
                                </div>

                                <!-- CAMPO 3: FLOAT — duracao_horas
                                     Duração em horas, podendo ter casas decimais (ex: 1.5) -->
                                <div class="mt-3">
                                    <label for="duracao_horas"
                                           class="form-label fw-bold text-muted small text-uppercase">
                                        <i class="bi bi-clock me-1"></i>
                                        Duração do Evento em Horas (FLOAT)
                                    </label>
                                    <input type="number"
                                           id="duracao_horas"
                                           class="form-control form-control-lg rounded-3 border-light-subtle bg-light text-dark"
                                           min="0" step="0.5"
                                           placeholder="Ex: 1.5" />
                                </div>

                                <!-- CAMPO 4: VARCHAR(100) — local_evento -->
                                <div class="mt-3">
                                    <label for="local_evento"
                                           class="form-label fw-bold text-muted small text-uppercase">
                                        <i class="bi bi-geo-alt me-1"></i>
                                        Local do Evento (VARCHAR 100)
                                    </label>
                                    <input type="text"
                                           id="local_evento"
                                           class="form-control form-control-lg rounded-3 border-light-subtle bg-light text-dark"
                                           maxlength="100"
                                           placeholder="Ex: Escola, Casa, Parque..." />
                                </div>

                                <!-- CAMPO 5: DATE — data_ocorrencia -->
                                <div class="mt-3">
                                    <label for="data_ocorrencia"
                                           class="form-label fw-bold text-muted small text-uppercase">
                                        <i class="bi bi-calendar-event me-1"></i>
                                        Data da Ocorrência (DATE)
                                    </label>
                                    <input type="date"
                                           id="data_ocorrencia"
                                           class="form-control form-control-lg rounded-3 border-light-subtle bg-light text-dark" />
                                </div>
                                <!-- FIM DOS CAMPOS NOVOS — RELATÓRIO -->
```

## PASSO 2.1.1 — HTML do formulário de Listar
**Arquivo:**home/listar_relatorios_responsavel.html (ou o nome exato do seu arquivo de listagem)

**ONDE ADICIONAR:**Dentro da div <div class="modal-body p-4 p-md-5">, logo após o bloco que exibe a Data de Envio e antes do bloco da Descrição Completa.

**Procure por:**
<div class="row mb-4 bg-light p-3 rounded-3 border border-light-subtle">
                        <div class="col-12">
                            <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-calendar-event me-1"></i> Data de Envio</label>
                            <p id="modal-data" class="mb-0 fw-bold fs-5 text-dark"></p>
                        </div>
                    </div>

**ADICIONE LOGO ABAIXO**
```html
<div class="row mb-4 bg-light p-3 rounded-3 border border-light-subtle g-3">
                        
                        <!-- DATE-->
                        <div class="col-12 col-sm-6 col-md-4 border-start border-light-subtle">
                            <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-calendar-check me-1"></i> Data da Ocorrência</label>
                            <p id="modal-data-ocorrencia" class="mb-0 fw-bold fs-6 text-dark">—</p>
                        </div>

                        <!-- VARCHAR-->
                        <div class="col-12 col-sm-6 col-md-4 border-start border-light-subtle">
                            <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-geo-alt me-1"></i> Local do Evento</label>
                            <p id="modal-local" class="mb-0 fw-bold fs-6 text-dark">—</p>
                        </div>

                        <!-- INT -->
                        <div class="col-12 col-sm-6 col-md-6 border-top pt-2 mt-2 border-light-subtle">
                            <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-activity me-1"></i> Intensidade</label>
                            <p id="modal-intensidade" class="mb-0 fw-bold fs-6 text-dark">—</p>
                        </div>

                        <!-- FLOAT-->
                        <div class="col-12 col-sm-6 col-md-6 border-top pt-2 mt-2 border-start border-light-subtle">
                            <label class="text-muted small text-uppercase fw-bold"><i class="bi bi-clock me-1"></i> Duração Estimada</label>
                            <p id="modal-duracao" class="mb-0 fw-bold fs-6 text-dark">—</p>
                        </div>
                    </div>

                    <!-- TEXT-->
                    <div class="mb-4">
                        <label class="text-muted small text-uppercase fw-bold mb-2"><i class="bi bi-journal-plus me-1"></i> Observação Adicional</label>
                        <div id="modal-observacao" class="p-3 bg-white rounded-3 border border-light-subtle shadow-sm text-dark"
                             style="white-space: pre-wrap; word-wrap: break-word; font-size: 0.95rem; min-height: 60px;">
                            —
                        </div>
                    </div>


## PASSO 2.2 — JS de criação do relatório
**Arquivo:** `js/responsavel/relatorio.js`

**ONDE MEXER — PONTO A:** Na captura dos valores dos campos, **antes** do `if (!dependente || !data ...)`. Procure:
```javascript
            const dependente = selectDependente.value;
            const data = inputData.value;
            const descricao = textareaDescricao.value.trim();
```

**ADICIONE LOGO ABAIXO:**
```javascript
            // =====================================================
            // CAMPOS NOVOS — captura dos valores do DOM
            // getElementById busca pelo id que colocamos no HTML
            // =====================================================
            
            // CAMPO TEXT: observacao_adicional
            const observacaoAdicional = document.getElementById('observacao_adicional')
                                        ? document.getElementById('observacao_adicional').value.trim()
                                        : '';
            
            // CAMPO INT: intensidade
            const intensidade = document.getElementById('intensidade')
                                 ? document.getElementById('intensidade').value
                                 : '';
            
            // CAMPO FLOAT: duracao_horas
            const duracaoHoras = document.getElementById('duracao_horas')
                                  ? document.getElementById('duracao_horas').value
                                  : '';
            
            // CAMPO VARCHAR: local_evento
            const localEvento = document.getElementById('local_evento')
                                 ? document.getElementById('local_evento').value.trim()
                                 : '';
            
            // CAMPO DATE: data_ocorrencia
            const dataOcorrencia = document.getElementById('data_ocorrencia')
                                    ? document.getElementById('data_ocorrencia').value
                                    : '';
```

**ONDE MEXER — PONTO B:** No `FormData`, onde os campos são adicionados. Procure:
```javascript
                formData.append('id_pessoa_tea', dependente);
                formData.append('data_evento', data);
                formData.append('descricao', descricao);
```

**ADICIONE LOGO ABAIXO:**
```javascript
                // =====================================================
                // CAMPOS NOVOS adicionados ao FormData
                // Esses nomes ('observacao_adicional', etc.) devem
                // bater com $_POST['observacao_adicional'] no PHP
                // =====================================================
                formData.append('observacao_adicional', observacaoAdicional); // TEXT
                formData.append('intensidade', intensidade);                   // INT
                formData.append('duracao_horas', duracaoHoras);                // FLOAT
                formData.append('local_evento', localEvento);                  // VARCHAR
                formData.append('data_ocorrencia', dataOcorrencia);            // DATE
```

---

## PASSO 2.3 — PHP de salvar relatório
**Arquivo:** `php/responsavel/relatorio_salvar.php`

**ONDE MEXER — PONTO A:** Captura dos campos POST. Procure:
```php
$id_pessoa_tea = intval($_POST['id_pessoa_tea'] ?? 0);
$data_evento   = $_POST['data_evento'] ?? '';
$descricao     = trim($_POST['descricao'] ?? '');
```

**ADICIONE LOGO ABAIXO:**
```php
// =====================================================
// CAMPOS NOVOS — captura do POST (relatório)
// =====================================================

// CAMPO TEXT: observacao_adicional
$observacao_adicional = trim($_POST['observacao_adicional'] ?? '');
// Se vier vazio, guarda null (não string vazia) no banco
if ($observacao_adicional === '') $observacao_adicional = null;

// CAMPO INT: intensidade — intval converte string para int
$intensidade = isset($_POST['intensidade']) && $_POST['intensidade'] !== ''
               ? intval($_POST['intensidade']) : null;

// CAMPO FLOAT: duracao_horas — floatval para decimal
$duracao_horas = isset($_POST['duracao_horas']) && $_POST['duracao_horas'] !== ''
                 ? floatval($_POST['duracao_horas']) : null;

// CAMPO VARCHAR: local_evento
$local_evento = trim($_POST['local_evento'] ?? '');
if ($local_evento === '') $local_evento = null;

// CAMPO DATE: data_ocorrencia
$data_ocorrencia = $_POST['data_ocorrencia'] ?? null;
if ($data_ocorrencia === '') $data_ocorrencia = null;
```

**ONDE MEXER — PONTO B:** A query INSERT. Procure:
```php
$sql = "INSERT INTO Relatorio (id_responsavel, id_pessoa_tea, data, descricao) VALUES (?, ?, ?, ?)";
$stmt = $conexao->prepare($sql);
$stmt->bind_param("iiss", $id_responsavel, $id_pessoa_tea, $data_evento, $descricao);
```

**SUBSTITUA por:**
```php
// =====================================================
// INSERT atualizado com os 5 campos novos
// Tipos bind_param:
//   i = int | s = string/text/varchar/date | d = float
// =====================================================
$sql = "INSERT INTO Relatorio 
            (id_responsavel, id_pessoa_tea, data, descricao,
             observacao_adicional, intensidade, duracao_horas,
             local_evento, data_ocorrencia) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexao->prepare($sql);
$stmt->bind_param(
    "iisssisd s",   // <- ATENÇÃO: sem espaço no código real, escrito separado aqui só para comentar:
                    // i=id_responsavel | i=id_pessoa_tea | s=data | s=descricao
                    // s=observacao_adicional | i=intensidade | d=duracao_horas
                    // s=local_evento | s=data_ocorrencia
    $id_responsavel,
    $id_pessoa_tea,
    $data_evento,
    $descricao,
    $observacao_adicional,  // TEXT  — s
    $intensidade,           // INT   — i
    $duracao_horas,         // FLOAT — d
    $local_evento,          // VARCHAR — s
    $data_ocorrencia        // DATE — s
);
```

> **IMPORTANTE:** O bind_param real deve ser uma string sem espaços: `"iisssisd s"` → escreva `"iisssids"`.

**Versão correta do bind_param:**
```php
$stmt->bind_param("iisssids",
    $id_responsavel,
    $id_pessoa_tea,
    $data_evento,
    $descricao,
    $observacao_adicional,
    $intensidade,
    $duracao_horas,
    $local_evento,
    $data_ocorrencia
);
```

> Espere: são 9 variáveis, mas "iisssids" tem só 8 letras. Correto: **"iisssisd s"** sem espaço = `"iisssids"` → Contagem: i i s s s i d s s = 9. String correta: `"iisssiдss"` 

**String de tipos CORRETA (9 parâmetros):**
```
i = id_responsavel
i = id_pessoa_tea
s = data_evento
s = descricao
s = observacao_adicional
i = intensidade
d = duracao_horas
s = local_evento
s = data_ocorrencia
→ "iisssidss"
```

```php
$stmt->bind_param("iisssidss",
    $id_responsavel,
    $id_pessoa_tea,
    $data_evento,
    $descricao,
    $observacao_adicional,
    $intensidade,
    $duracao_horas,
    $local_evento,
    $data_ocorrencia
);
```

---

## PASSO 2.4 — PHP de listagem (responsável e profissional)
**Arquivo:** `php/responsavel/relatorios_listar.php`

Procure o bloco SELECT:
```sql
        SELECT 
            r.id_relatorio,
            r.data,
            r.descricao,
            u.nome AS nome_dependente
        FROM Relatorio r
```

**ADICIONE os campos novos no SELECT (após `r.descricao,`):**
```sql
        SELECT 
            r.id_relatorio,
            r.data,
            r.descricao,
            -- CAMPOS NOVOS RELATÓRIO --
            r.observacao_adicional,   -- TEXT
            r.intensidade,            -- INT
            r.duracao_horas,          -- FLOAT
            r.local_evento,           -- VARCHAR
            r.data_ocorrencia,        -- DATE
            u.nome AS nome_dependente
        FROM Relatorio r
```

Faça o mesmo em `php/profissional/relatorios_listar.php`. Procure:
```sql
            r.id_relatorio,
            r.data,
            r.descricao,
            u_paciente.nome    AS nome_paciente,
```

**ADICIONE após `r.descricao,`:**
```sql
            r.id_relatorio,
            r.data,
            r.descricao,
            -- CAMPOS NOVOS RELATÓRIO --
            r.observacao_adicional,
            r.intensidade,
            r.duracao_horas,
            r.local_evento,
            r.data_ocorrencia,
            u_paciente.nome    AS nome_paciente,
```

---

## PASSO 2.5 — JS de listagem dos cards
**Arquivo:** `js/responsavel/lista_relatorios.js`

Na função `abrirModal`, procure:
```javascript
window.abrirModal = function(rel) {
    document.getElementById('modal-data').textContent = new Date(rel.data + 'T00:00:00').toLocaleDateString('pt-BR');
    document.getElementById('modal-descricao').textContent = rel.descricao;
```

**ADICIONE logo após essas linhas (antes do `modal.show()`):**
```javascript
    // =====================================================
    // CAMPOS NOVOS exibidos no modal de detalhes
    // rel.observacao_adicional etc. já chegam do PHP
    // =====================================================

    // Para exibir no modal precisamos de elementos no HTML.
    // Adicione os elementos no HTML do modal (lista_relatorios_responsavel.html)
    // e preencha aqui:
    const elObs = document.getElementById('modal-observacao');
    if (elObs) elObs.textContent = rel.observacao_adicional || '—';

    const elInt = document.getElementById('modal-intensidade');
    if (elInt) elInt.textContent = rel.intensidade ? `${rel.intensidade}/10` : '—';

    const elDur = document.getElementById('modal-duracao');
    if (elDur) elDur.textContent = rel.duracao_horas ? `${rel.duracao_horas}h` : '—';

    const elLocal = document.getElementById('modal-local');
    if (elLocal) elLocal.textContent = rel.local_evento || '—';

    const elDataOc = document.getElementById('modal-data-ocorrencia');
    if (elDataOc) elDataOc.textContent = rel.data_ocorrencia
        ? new Date(rel.data_ocorrencia + 'T00:00:00').toLocaleDateString('pt-BR')
        : '—';
```

No trecho do **card** (dentro do `relatorios.forEach`), após onde é exibida a `dataFormatada`, adicione também:
```javascript
            // CAMPOS NOVOS no card (visão rápida)
            <small class="d-block text-muted">
                ${ rel.local_evento ? `<i class="bi bi-geo-alt me-1"></i>${rel.local_evento}` : '' }
            </small>
            <small class="d-block text-muted">
                ${ rel.intensidade ? `Intensidade: ${rel.intensidade}/10` : '' }
            </small>
```

Faça o mesmo ajuste em `js/profissional/lista_relatorios.js` na função `abrirModal` e no card.


# CRUD 3 — PROFISSIONAL

**Arquivos que você vai mexer:**
- `home/cadastro_profissional.html`
- `php/usuario_novo.php`
- `php/profissional/listar-profissionais.php`
- `js/profissional/listar-profissionais.js`
- `js/profissional/profissional_novo.js`

---
## PASSO 1 — HTML do formulário
**Arquivo:** `home/cadastro_profissional.html`

**Onde adicionar:** Entre a linha **92** (`</div>` que fecha o bloco da senha) e a linha **95** (`<div class="p-3 bg-light rounded-4...` que começa a seção de documentação).

Ou seja, você vai **colar o bloco abaixo entre as linhas 93 e 94** (entre o Telefone e Criar Senha):

```html
                <!-- =============================================
                     CAMPOS NOVOS — PROFISSIONAL
                     Linha de referência: logo antes do bloco de
                     "Documentação Obrigatória" (linha 95)
                ============================================= -->

                <!-- CAMPO 1: TEXT — biografia -->
                <div class="col-12">
                    <label class="form-label small fw-bold text-muted">Biografia / Apresentação (TEXT)</label>
                    <textarea name="biografia" id="biografia"
                              class="form-control rounded-3" rows="3"
                              placeholder="Breve apresentação do profissional..."></textarea>
                </div>

                <!-- CAMPO 2: INT — anos_experiencia -->
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Anos de Experiência (INT)</label>
                    <input type="number" name="anos_experiencia" id="anos_experiencia"
                           class="form-control rounded-3"
                           min="0" max="60" step="1" placeholder="Ex: 5">
                </div>

                <!-- CAMPO 3: FLOAT — valor_consulta -->
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Valor da Consulta R$ (FLOAT)</label>
                    <input type="number" name="valor_consulta" id="valor_consulta"
                           class="form-control rounded-3"
                           min="0" step="0.01" placeholder="Ex: 150.00">
                </div>

                <!-- CAMPO 4: VARCHAR(80) — area_atuacao -->
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Área de Atuação Principal (VARCHAR 80)</label>
                    <input type="text" name="area_atuacao" id="area_atuacao"
                           class="form-control rounded-3"
                           maxlength="80" placeholder="Ex: Autismo Infantil">
                </div>

                <!-- CAMPO 5: DATE — data_inicio_clinica -->
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Data de Início na Clínica (DATE)</label>
                    <input type="date" name="data_inicio_clinica" id="data_inicio_clinica"
                           class="form-control rounded-3">
                </div>

                <!-- FIM CAMPOS NOVOS — PROFISSIONAL -->
```

> **Como identificar o lugar certo:** procure pelo texto `Documentação Obrigatória` no arquivo. O bloco acima entra ANTES dessa linha.

---

## PASSO 2 — JS do formulário (envio dos dados)
**Arquivo:** `js/profissional/profissional_novo.js`

**Onde adicionar:** Na linha **146**, depois de `formData.append('tipo_usuario', 'ProfissionalSaude');`

Cole as 5 linhas abaixo **logo após a linha 146**:

```javascript
        // CAMPOS NOVOS — PROFISSIONAL — enviando para o PHP
        formData.append('biografia',           document.getElementById('biografia').value.trim());          // TEXT
        formData.append('anos_experiencia',    document.getElementById('anos_experiencia').value);           // INT
        formData.append('valor_consulta',      document.getElementById('valor_consulta').value);             // FLOAT
        formData.append('area_atuacao',        document.getElementById('area_atuacao').value.trim());        // VARCHAR
        formData.append('data_inicio_clinica', document.getElementById('data_inicio_clinica').value);        // DATE
```

> **Referência visual:** a linha 146 atual é `formData.append('tipo_usuario', 'ProfissionalSaude');` — cole logo abaixo dela.

---

## PASSO 3 — PHP de criação
**Arquivo:** `php/usuario_novo.php`

Você vai mexer em **2 pontos** neste arquivo.

---

### PONTO A — Capturar os dados novos do POST
**Onde:** Linha **22**, após `$especialidade = htmlspecialchars($_POST['especialidade'] ...`

Cole as linhas abaixo **após a linha 22**:

```php
    // CAMPOS NOVOS — PROFISSIONAL — captura do formulário
    $biografia           = htmlspecialchars($_POST['biografia'] ?? '', ENT_QUOTES, 'UTF-8');              // TEXT
    $anos_experiencia    = $_POST['anos_experiencia'] !== '' ? intval($_POST['anos_experiencia']) : null;  // INT
    $valor_consulta      = $_POST['valor_consulta']   !== '' ? floatval($_POST['valor_consulta']) : null;  // FLOAT
    $area_atuacao        = htmlspecialchars($_POST['area_atuacao'] ?? '', ENT_QUOTES, 'UTF-8');            // VARCHAR
    $data_inicio_clinica = $_POST['data_inicio_clinica'] ?? null;                                          // DATE
```

---

### PONTO B — Incluir os campos no INSERT do banco
**Onde:** Linha **81** — essa é a linha atual que você vai **substituir**:

```php
        $stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) VALUES (?, ?, ?)");
        $stmt_prof->bind_param("iss", $id_usuario, $registro_profissional, $especialidade);
```

**Substitua essas 2 linhas por:**

```php
        // INSERT com os 5 campos novos incluídos
        $stmt_prof = $conexao->prepare("INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade, biografia, anos_experiencia, valor_consulta, area_atuacao, data_inicio_clinica) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        // i=inteiro | s=texto/varchar/date | d=decimal(float)
        // ordem: id_usuario(i), registro(s), especialidade(s), biografia(s), anos(i), valor(d), area(s), data(s)
        $stmt_prof->bind_param("isssidss", $id_usuario, $registro_profissional, $especialidade, $biografia, $anos_experiencia, $valor_consulta, $area_atuacao, $data_inicio_clinica);
```

> A linha 83 `$stmt_prof->execute(); $stmt_prof->close();` **não muda**, fica igual.

---

## PASSO 4 — PHP de listagem
**Arquivo:** `php/profissional/listar-profissionais.php`

**Onde:** Linha **37** — dentro do SELECT da listagem geral (o bloco `else`, sem filtro por `?id`).

A linha 37 atual é:
```php
                    P.especialidade, P.registro_profissional,
```

**Substitua a linha 37 por:**
```php
                    P.especialidade, P.registro_profissional,
                    P.biografia, P.anos_experiencia, P.valor_consulta,
                    P.area_atuacao, P.data_inicio_clinica,
```

> Só adicione as 2 linhas novas logo após `P.registro_profissional,` — não mexa em mais nada no arquivo.

---

## PASSO 5 — JS de listagem (exibir na tabela)
**Arquivo:** `js/profissional/listar-profissionais.js`

Você vai mexer em **2 pontos**.

---

### PONTO A — Adicionar cabeçalho na tabela (`<th>`)
**Onde:** Linha **31**, após `<th class="py-3">CRP/CRM</th>`

A linha 31 atual é:
```javascript
                    <th class="py-3">CRP/CRM</th>
```

**Substitua por:**
```javascript
                    <th class="py-3">CRP/CRM</th>
                    <th class="py-3">Informações</th>
```

> Só adiciona uma linha nova de `<th>` — não muda mais nada no cabeçalho.

---

### PONTO B — Adicionar célula de dados (`<td>`) em cada linha
**Onde:** Linha **52**, após `<td class="text-muted">${prof.registro_profissional}</td>`

A linha 52 atual é:
```javascript
                <td class="text-muted">${prof.registro_profissional}</td>
```

**Substitua por:**
```javascript
                <td class="text-muted">${prof.registro_profissional}</td>
                <td>
                    ${ prof.biografia            ? `<small><b>Bio:</b> ${prof.biografia.length > 50 ? prof.biografia.substring(0, 50) + '...' : prof.biografia}</small><br>` : '' }
                    ${ prof.area_atuacao    ? `<small><b>Área:</b> ${prof.area_atuacao}</small><br>` : '' }
                    ${ prof.anos_experiencia ? `<small><b>Exp.:</b> ${prof.anos_experiencia} anos</small><br>` : '' }
                    ${ prof.valor_consulta  ? `<small><b>Consulta:</b> R$ ${parseFloat(prof.valor_consulta).toFixed(2)}</small><br>` : '' }
                    ${ prof.data_inicio_clinica ? `<small><b>Desde:</b> ${new Date(prof.data_inicio_clinica + 'T00:00:00').toLocaleDateString('pt-BR')}</small>` : '' }
                </td>
```

> Só adiciona a `<td>` nova — o restante da linha (`<td class="text-end">` com os botões) não muda.
---

# CRUD 4 — RESPONSÁVEL

**Arquivos que você vai mexer:**
- `home/cadastro_responsavel.html`
- `php/usuario_novo.php` (mesmo arquivo do profissional, bloco diferente)
- `php/responsavel/responsavel_get.php`
- `js/responsavel/lista_responsavel.js`
- `js/responsavel/responsavel_novo.js`

---

## PASSO 5.1 — HTML do formulário de cadastro
**Arquivo:** `home/cadastro_responsavel.html`

Procure onde termina o campo de senha (o `<input type="password" id="senha"...>`). Adicione os campos novos **logo abaixo**, antes do botão de submit:

```html
<!-- ============================================
     CAMPOS NOVOS — RESPONSÁVEL (Autoria)
============================================ -->

<!-- CAMPO 1: TEXT — observacao_responsavel -->
<div class="form-floating mb-3">
    <textarea class="form-control rounded-3 border-light-subtle"
              id="observacao_responsavel"
              name="observacao_responsavel"
              placeholder="Observação"
              style="height: 90px;"></textarea>
    <label for="observacao_responsavel" class="text-muted">
        <i class="bi bi-journal-text me-2"></i>Observação sobre o Responsável (TEXT)
    </label>
</div>

<!-- CAMPO 2: INT — num_dependentes -->
<div class="form-floating mb-3">
    <input type="number"
           class="form-control rounded-3 border-light-subtle"
           id="num_dependentes"
           name="num_dependentes"
           placeholder="Dependentes"
           min="0" step="1" />
    <label for="num_dependentes" class="text-muted">
        <i class="bi bi-people me-2"></i>Número de Dependentes (INT)
    </label>
</div>

<!-- CAMPO 3: FLOAT — renda_familiar -->
<div class="form-floating mb-3">
    <input type="number"
           class="form-control rounded-3 border-light-subtle"
           id="renda_familiar"
           name="renda_familiar"
           placeholder="Renda"
           min="0" step="0.01" />
    <label for="renda_familiar" class="text-muted">
        <i class="bi bi-currency-dollar me-2"></i>Renda Familiar Mensal R$ (FLOAT)
    </label>
</div>

<!-- CAMPO 4: VARCHAR(50) — parentesco -->
<div class="form-floating mb-3">
    <input type="text"
           class="form-control rounded-3 border-light-subtle"
           id="parentesco"
           name="parentesco"
           placeholder="Parentesco"
           maxlength="50" />
    <label for="parentesco" class="text-muted">
        <i class="bi bi-diagram-3 me-2"></i>Grau de Parentesco (VARCHAR 50)
    </label>
</div>

<!-- CAMPO 5: DATE — data_vinculo -->
<div class="form-floating mb-3">
    <input type="date"
           class="form-control rounded-3 border-light-subtle"
           id="data_vinculo"
           name="data_vinculo"
           placeholder="Data Vínculo" />
    <label for="data_vinculo" class="text-muted">
        <i class="bi bi-calendar-plus me-2"></i>Data de Vínculo (DATE)
    </label>
</div>
<!-- FIM DOS CAMPOS NOVOS — RESPONSÁVEL -->
```

---

## PASSO 5.2 — JS de criação do responsável
**Arquivo:** `js/responsavel/responsavel_novo.js`

Procure onde está o `FormData` sendo montado. Após as linhas:
```javascript
            formData.append('nome', nome);
            formData.append('email', email);
            formData.append('cpf', cpf);
            formData.append('telefone', telefone);
            formData.append('data_nascimento', dataNascimento);
            formData.append('senha', senha);
            formData.append('tipo_usuario', 'ResponsavelLegal');
```

**ADICIONE LOGO ABAIXO:**
```javascript
            // =====================================================
            // CAMPOS NOVOS — RESPONSÁVEL — append no FormData
            // =====================================================
            formData.append('observacao_responsavel',       // TEXT
                document.getElementById('observacao_responsavel')?.value?.trim() || '');
            
            formData.append('num_dependentes',              // INT
                document.getElementById('num_dependentes')?.value || '');
            
            formData.append('renda_familiar',               // FLOAT
                document.getElementById('renda_familiar')?.value || '');
            
            formData.append('parentesco',                   // VARCHAR
                document.getElementById('parentesco')?.value?.trim() || '');
            
            formData.append('data_vinculo',                 // DATE
                document.getElementById('data_vinculo')?.value || '');
```

---

## PASSO 5.3 — PHP de criação (usuario_novo.php)
**Arquivo:** `php/usuario_novo.php`

Os campos de Responsável ficam na tabela `Usuario` (já que `ResponsavelLegal` só tem `id_usuario` e `id_profissional`).

**ONDE MEXER — PONTO A:** Na captura de variáveis (no topo do arquivo onde já captura nome, email etc.). Adicione junto às outras capturas:
```php
// =====================================================
// CAMPOS NOVOS — RESPONSÁVEL — captura do POST
// Só usados quando tipo_usuario = ResponsavelLegal
// =====================================================

// CAMPO TEXT
$observacao_responsavel = htmlspecialchars($_POST['observacao_responsavel'] ?? '', ENT_QUOTES, 'UTF-8');
if ($observacao_responsavel === '') $observacao_responsavel = null;

// CAMPO INT
$num_dependentes = isset($_POST['num_dependentes']) && $_POST['num_dependentes'] !== ''
                   ? intval($_POST['num_dependentes']) : null;

// CAMPO FLOAT
$renda_familiar = isset($_POST['renda_familiar']) && $_POST['renda_familiar'] !== ''
                  ? floatval($_POST['renda_familiar']) : null;

// CAMPO VARCHAR
$parentesco = htmlspecialchars($_POST['parentesco'] ?? '', ENT_QUOTES, 'UTF-8');
if ($parentesco === '') $parentesco = null;

// CAMPO DATE
$data_vinculo = $_POST['data_vinculo'] ?? null;
if ($data_vinculo === '') $data_vinculo = null;
```

**ONDE MEXER — PONTO B:** Encontre o bloco `if ($tipo_usuario === 'ResponsavelLegal')`. Dentro dele, após o INSERT em `ResponsavelLegal`, adicione um UPDATE na tabela `Usuario` para salvar os campos extras:

```php
// =====================================================
// Salva os campos novos do responsável na tabela Usuario
// Usamos UPDATE porque o INSERT no Usuario já foi feito acima
// =====================================================
if ($tipo_usuario === 'ResponsavelLegal') {
    $stmt_resp_campos = $conexao->prepare(
        "UPDATE Usuario 
         SET observacao_responsavel = ?,
             num_dependentes        = ?,
             renda_familiar         = ?,
             parentesco             = ?,
             data_vinculo           = ?
         WHERE id_usuario = ?"
    );
    // Tipos: s=text | i=int | d=float | s=varchar | s=date | i=id
    $stmt_resp_campos->bind_param("sidssi",
        $observacao_responsavel,  // s — TEXT
        $num_dependentes,         // i — INT
        $renda_familiar,          // d — FLOAT
        $parentesco,              // s — VARCHAR
        $data_vinculo,            // s — DATE
        $id_usuario               // i — INT (id do usuário recém criado)
    );
    $stmt_resp_campos->execute();
    $stmt_resp_campos->close();
}
```

---

## PASSO 5.4 — PHP de listagem de responsáveis
**Arquivo:** `php/responsavel/responsavel_get.php`

Há dois SELECTs (um com `?id` e outro sem). Em **ambos**, adicione os campos novos. Procure:
```sql
SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, T.telefone
```

**SUBSTITUA por:**
```sql
SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, T.telefone,
       -- CAMPOS NOVOS RESPONSÁVEL --
       U.observacao_responsavel,
       U.num_dependentes,
       U.renda_familiar,
       U.parentesco,
       U.data_vinculo
```

(Faça isso nos **dois** SELECTs dentro do arquivo — o do `if isset $_GET['id']` e o do `else`.)

---

## PASSO 5.5 — JS de listagem dos responsáveis
**Arquivo:** `js/responsavel/lista_responsavel.js`

Na função `preencherTabela`, procure onde está o `<thead>`:
```javascript
                    <th>Responsável</th>
                    <th>CPF</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th class="text-end">Ações</th>
```

**SUBSTITUA por:**
```javascript
                    <th>Responsável</th>
                    <th>CPF</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Parentesco</th>
                    <th>Dependentes</th>
                    <th class="text-end">Ações</th>
```

E no template de cada linha `<tr>`, após `<td>${r.telefone || 'Não informado'}</td>`, adicione:
```javascript
                <td>${r.parentesco || '—'}</td>
                <td>${r.num_dependentes !== null ? r.num_dependentes : '—'}</td>
```

> **Atualize o colspan** de qualquer `<td colspan="5">` para `colspan="7"`.

---

---

# CRUD 5 — ADMIN

**Arquivos que você vai mexer:**
- `home/cadastro_admin.html`
- `js/admin/admin_novo.js`
- `php/usuario_novo.php` (bloco do Administrador)
- `php/admin/administrador_get.php`
- `js/admin/lista_admin.js`

---

## PASSO 6.1 — HTML do formulário de cadastro Admin
**Arquivo:** `home/cadastro_admin.html`

Procure o campo de senha (`<input type="password" id="senha"`). Adicione os campos novos **logo abaixo**, antes do botão de criar:

```html
<!-- ============================================
     CAMPOS NOVOS — ADMIN (Autoria)
============================================ -->

<!-- CAMPO 1: TEXT — bio_admin -->
<div class="form-floating mb-3">
    <textarea class="form-control rounded-3 border-light-subtle"
              id="bio_admin"
              name="bio_admin"
              placeholder="Bio"
              style="height: 90px;"></textarea>
    <label for="bio_admin" class="text-muted">
        <i class="bi bi-person-lines-fill me-2"></i>Apresentação do Admin (TEXT)
    </label>
    <div id="erroBio" class="text-danger small mt-1"></div>
</div>

<!-- CAMPO 2: INT — nivel_acesso -->
<div class="form-floating mb-3">
    <input type="number"
           class="form-control rounded-3 border-light-subtle"
           id="nivel_acesso"
           name="nivel_acesso"
           placeholder="Nível"
           min="1" max="3" step="1" />
    <label for="nivel_acesso" class="text-muted">
        <i class="bi bi-shield-lock me-2"></i>Nível de Acesso 1-3 (INT)
    </label>
    <div id="erroNivel" class="text-danger small mt-1"></div>
</div>

<!-- CAMPO 3: FLOAT — percentual_meta -->
<div class="form-floating mb-3">
    <input type="number"
           class="form-control rounded-3 border-light-subtle"
           id="percentual_meta"
           name="percentual_meta"
           placeholder="Meta"
           min="0" max="100" step="0.5" />
    <label for="percentual_meta" class="text-muted">
        <i class="bi bi-graph-up me-2"></i>Meta de Aprovações % (FLOAT)
    </label>
    <div id="erroMeta" class="text-danger small mt-1"></div>
</div>

<!-- CAMPO 4: VARCHAR(60) — setor -->
<div class="form-floating mb-3">
    <input type="text"
           class="form-control rounded-3 border-light-subtle"
           id="setor"
           name="setor"
           placeholder="Setor"
           maxlength="60" />
    <label for="setor" class="text-muted">
        <i class="bi bi-building me-2"></i>Setor / Departamento (VARCHAR 60)
    </label>
    <div id="erroSetor" class="text-danger small mt-1"></div>
</div>

<!-- CAMPO 5: DATE — data_posse -->
<div class="form-floating mb-3">
    <input type="date"
           class="form-control rounded-3 border-light-subtle"
           id="data_posse"
           name="data_posse"
           placeholder="Data Posse" />
    <label for="data_posse" class="text-muted">
        <i class="bi bi-calendar-check me-2"></i>Data de Posse / Início (DATE)
    </label>
    <div id="erroPosse" class="text-danger small mt-1"></div>
</div>
<!-- FIM DOS CAMPOS NOVOS — ADMIN -->
```

---

## PASSO 6.2 — JS de criação do Admin
**Arquivo:** `js/admin/admin_novo.js`

Procure onde está o bloco `formData.append(...)`:
```javascript
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('cpf', document.getElementById('cpf').value);
        formData.append('data_nascimento', document.getElementById('data_nascimento').value);
        formData.append('senha', document.getElementById('senha').value);
        formData.append('tipo_usuario', 'Administrador');
```

**ADICIONE LOGO ABAIXO:**
```javascript
        // =====================================================
        // CAMPOS NOVOS — ADMIN — append no FormData
        // =====================================================
        formData.append('bio_admin',          // TEXT
            document.getElementById('bio_admin')?.value?.trim() || '');
        
        formData.append('nivel_acesso',       // INT
            document.getElementById('nivel_acesso')?.value || '');
        
        formData.append('percentual_meta',    // FLOAT
            document.getElementById('percentual_meta')?.value || '');
        
        formData.append('setor',              // VARCHAR
            document.getElementById('setor')?.value?.trim() || '');
        
        formData.append('data_posse',         // DATE
            document.getElementById('data_posse')?.value || '');
```

---

## PASSO 6.3 — PHP de criação (usuario_novo.php)
**Arquivo:** `php/usuario_novo.php`

**ONDE MEXER — PONTO A:** Captura das variáveis. Adicione junto às outras:
```php
// =====================================================
// CAMPOS NOVOS — ADMIN — captura do POST
// Usados apenas quando tipo_usuario = Administrador
// =====================================================

// CAMPO TEXT: bio_admin
$bio_admin = htmlspecialchars($_POST['bio_admin'] ?? '', ENT_QUOTES, 'UTF-8');
if ($bio_admin === '') $bio_admin = null;

// CAMPO INT: nivel_acesso
$nivel_acesso = isset($_POST['nivel_acesso']) && $_POST['nivel_acesso'] !== ''
                ? intval($_POST['nivel_acesso']) : null;

// CAMPO FLOAT: percentual_meta
$percentual_meta = isset($_POST['percentual_meta']) && $_POST['percentual_meta'] !== ''
                   ? floatval($_POST['percentual_meta']) : null;

// CAMPO VARCHAR: setor
$setor = htmlspecialchars($_POST['setor'] ?? '', ENT_QUOTES, 'UTF-8');
if ($setor === '') $setor = null;

// CAMPO DATE: data_posse
$data_posse = $_POST['data_posse'] ?? null;
if ($data_posse === '') $data_posse = null;
```

**ONDE MEXER — PONTO B:** Procure o bloco `if ($tipo_usuario === 'Administrador')`. Dentro dele há algo como:
```php
INSERT INTO Administrador (id_usuario, status_adm) VALUES (?, ?)
```

**SUBSTITUA por:**
```php
// =====================================================
// INSERT Administrador com os 5 campos novos
// A tabela Administrador foi alterada via SQL no início
// =====================================================
$stmt_adm = $conexao->prepare(
    "INSERT INTO Administrador 
         (id_usuario, status_adm,
          bio_admin, nivel_acesso, percentual_meta,
          setor, data_posse)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);
// Tipos: i=id_usuario | i=status_adm(boolean/int)
//        s=bio_admin | i=nivel_acesso | d=percentual_meta
//        s=setor | s=data_posse
$status_adm = 1; // Admin ativo por padrão
$stmt_adm->bind_param("isiidss",
    $id_usuario,      // i
    $status_adm,      // i
    $bio_admin,       // s — TEXT (novo)
    $nivel_acesso,    // i — INT (novo)
    $percentual_meta, // d — FLOAT (novo)
    $setor,           // s — VARCHAR (novo)
    $data_posse       // s — DATE (novo)
);
$stmt_adm->execute();
$stmt_adm->close();
```

---

## PASSO 6.4 — PHP de listagem de admins
**Arquivo:** `php/admin/administrador_get.php`

Há dois SELECTs. Em **ambos**, adicione as colunas novas. Procure:
```sql
                    U.id_usuario, 
                    U.nome, 
                    U.email, 
                    U.cpf,
                    U.data_nascimento, 
                    A.status_adm
```

**SUBSTITUA por:**
```sql
                    U.id_usuario, 
                    U.nome, 
                    U.email, 
                    U.cpf,
                    U.data_nascimento, 
                    A.status_adm,
                    -- CAMPOS NOVOS ADMIN --
                    A.bio_admin,
                    A.nivel_acesso,
                    A.percentual_meta,
                    A.setor,
                    A.data_posse
```

(Faça isso nos **dois** SELECTs do arquivo — o com filtro por `?id` e o sem filtro.)

---

## PASSO 6.5 — JS de listagem de admins
**Arquivo:** `js/admin/lista_admin.js`

Na função `preencherTabela`, procure o `<thead>`:
```javascript
                            <th class="text-secondary fw-semibold py-3 ps-3">Nome</th>
                            <th class="text-secondary fw-semibold py-3">E-mail</th>
                            <th class="text-secondary fw-semibold py-3">CPF</th>
                            <th class="text-secondary fw-semibold py-3 text-center">Status</th>
                            <th class="text-secondary fw-semibold py-3 text-end pe-3">Ações</th>
```

**ADICIONE uma coluna nova entre CPF e Status:**
```javascript
                            <th class="text-secondary fw-semibold py-3 ps-3">Nome</th>
                            <th class="text-secondary fw-semibold py-3">E-mail</th>
                            <th class="text-secondary fw-semibold py-3">CPF</th>
                            <th class="text-secondary fw-semibold py-3">Detalhes Admin</th>
                            <th class="text-secondary fw-semibold py-3 text-center">Status</th>
                            <th class="text-secondary fw-semibold py-3 text-end pe-3">Ações</th>
```

E no template da linha `<tr>`, após `<td class="text-muted">${adm.cpf || '---'}</td>`, adicione:
```javascript
                <td>
                    <!-- CAMPOS NOVOS ADMIN na listagem -->
                    ${ adm.setor
                       ? `<span class="badge bg-secondary-subtle text-secondary">${adm.setor}</span><br>`
                       : '' }
                    ${ adm.nivel_acesso !== null && adm.nivel_acesso !== undefined
                       ? `<small class="text-muted">Nível ${adm.nivel_acesso}</small><br>`
                       : '' }
                    ${ adm.percentual_meta !== null && adm.percentual_meta !== undefined
                       ? `<small class="text-muted">Meta: ${adm.percentual_meta}%</small><br>`
                       : '' }
                    ${ adm.data_posse
                       ? `<small class="text-muted">Posse: ${new Date(adm.data_posse + 'T00:00:00').toLocaleDateString('pt-BR')}</small>`
                       : '' }
                </td>
```

> **Atualize os colspans** de `colspan="5"` para `colspan="6"` onde houver (ex: linha de "nenhum administrador cadastrado").


# CRUD 6 — PESSOA TEA

## PASSO 1 — HTML do formulário de criação
**Arquivo:** `home/cadastro_pessoa_tea.html`

**Onde adicionar:** Entre a linha **139** (que fecha o bloco do CPF do Responsável com `</div>`) e a linha **141** (onde começa o `<div id="divErro"`).

Cole o bloco abaixo **entre as linhas 139 e 141**:

```html
                        <!-- =============================================
                             CAMPOS NOVOS — PESSOA TEA
                             Entram DEPOIS do campo cpf_responsavel
                             e ANTES do divErro (linha 141)
                        ============================================= -->

                        <!-- CAMPO 1: TEXT — anotacao_clinica
                             Texto longo, usa textarea com form-floating
                             igual ao campo "observacao" já existente -->
                        <div class="mb-3">
                            <div class="form-floating">
                                <textarea id="anotacao_clinica"
                                          name="anotacao_clinica"
                                          class="form-control rounded-3 border-light-subtle"
                                          placeholder="Anotação"
                                          style="height: 100px;"></textarea>
                                <label for="anotacao_clinica" class="text-muted">
                                    <i class="bi bi-journal-medical me-2"></i>Anotação Clínica Adicional (TEXT)
                                </label>
                            </div>
                        </div>

                        <div class="row g-3 mb-3">
                            <!-- CAMPO 2: INT — idade_diagnostico
                                 Idade em que foi diagnosticado, número inteiro -->
                            <div class="col-md-6">
                                <div class="form-floating">
                                    <input type="number"
                                           id="idade_diagnostico"
                                           name="idade_diagnostico"
                                           class="form-control rounded-3 border-light-subtle"
                                           placeholder="Idade"
                                           min="0" max="99" step="1">
                                    <label for="idade_diagnostico" class="text-muted">
                                        <i class="bi bi-calendar2-heart me-2"></i>Idade no Diagnóstico (INT)
                                    </label>
                                </div>
                            </div>

                            <!-- CAMPO 3: FLOAT — indice_desenvolvimento
                                 Índice com casas decimais, ex: 7.5 -->
                            <div class="col-md-6">
                                <div class="form-floating">
                                    <input type="number"
                                           id="indice_desenvolvimento"
                                           name="indice_desenvolvimento"
                                           class="form-control rounded-3 border-light-subtle"
                                           placeholder="Índice"
                                           min="0" max="10" step="0.1">
                                    <label for="indice_desenvolvimento" class="text-muted">
                                        <i class="bi bi-graph-up me-2"></i>Índice de Desenvolvimento (FLOAT)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="row g-3 mb-3">
                            <!-- CAMPO 4: VARCHAR(30) — codigo_paciente
                                 Código curto, maxlength bate com o VARCHAR(30) do banco -->
                            <div class="col-md-6">
                                <div class="form-floating">
                                    <input type="text"
                                           id="codigo_paciente"
                                           name="codigo_paciente"
                                           class="form-control rounded-3 border-light-subtle"
                                           placeholder="Código"
                                           maxlength="30">
                                    <label for="codigo_paciente" class="text-muted">
                                        <i class="bi bi-upc me-2"></i>Código do Paciente (VARCHAR 30)
                                    </label>
                                </div>
                            </div>

                            <!-- CAMPO 5: DATE — data_ingresso
                                 Data de entrada no programa, type="date" vira DATE no banco -->
                            <div class="col-md-6">
                                <div class="form-floating">
                                    <input type="date"
                                           id="data_ingresso"
                                           name="data_ingresso"
                                           class="form-control rounded-3 border-light-subtle"
                                           placeholder="Data Ingresso">
                                    <label for="data_ingresso" class="text-muted">
                                        <i class="bi bi-calendar-plus me-2"></i>Data de Ingresso (DATE)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <!-- FIM CAMPOS NOVOS — PESSOA TEA -->
```

> **Como achar o lugar certo:** procure pelo texto `O responsável já deve estar cadastrado` (linha 137). O bloco entra logo após o `</div>` que fecha esse campo.

---

## PASSO 2 — JS do formulário (envio dos dados)
**Arquivo:** `js/pessoa_tea.js/pessoa_tea_novo.js`

**Onde adicionar:** Linha **150**, logo após o bloco do `observacao` (que termina com `}`  na linha 150).

Cole as 5 linhas abaixo **após a linha 150**:

```javascript
                // CAMPOS NOVOS — PESSOA TEA — enviando para o PHP
                const valAnotacao = document.getElementById('anotacao_clinica');
                if(valAnotacao) formData.append('anotacao_clinica', valAnotacao.value.trim());              // TEXT

                const valIdade = document.getElementById('idade_diagnostico');
                if(valIdade) formData.append('idade_diagnostico', valIdade.value);                          // INT

                const valIndice = document.getElementById('indice_desenvolvimento');
                if(valIndice) formData.append('indice_desenvolvimento', valIndice.value);                   // FLOAT

                const valCodigo = document.getElementById('codigo_paciente');
                if(valCodigo) formData.append('codigo_paciente', valCodigo.value.trim());                   // VARCHAR

                const valDataIngresso = document.getElementById('data_ingresso');
                if(valDataIngresso) formData.append('data_ingresso', valDataIngresso.value);                // DATE
```

> **Referência visual:** a linha 150 atual termina com `}` fechando o `if(valObservacao)`. Cole logo após essa chave.

---

## PASSO 3 — PHP de criação
**Arquivo:** `php/usuario_novo.php`

Você mexe em **2 pontos** neste arquivo.

---

### PONTO A — Capturar os 5 campos novos do POST
**Onde:** Linha **26**, logo após `$cpf_responsavel = htmlspecialchars(...)`.

Cole as linhas abaixo **após a linha 26**:

```php
    // CAMPOS NOVOS — PESSOA TEA — captura do POST
    $anotacao_clinica       = htmlspecialchars($_POST['anotacao_clinica'] ?? '', ENT_QUOTES, 'UTF-8');       // TEXT
    $idade_diagnostico      = isset($_POST['idade_diagnostico']) && $_POST['idade_diagnostico'] !== ''
                              ? intval($_POST['idade_diagnostico']) : null;                                   // INT
    $indice_desenvolvimento = isset($_POST['indice_desenvolvimento']) && $_POST['indice_desenvolvimento'] !== ''
                              ? floatval($_POST['indice_desenvolvimento']) : null;                            // FLOAT
    $codigo_paciente        = htmlspecialchars($_POST['codigo_paciente'] ?? '', ENT_QUOTES, 'UTF-8');        // VARCHAR
    $data_ingresso          = !empty($_POST['data_ingresso']) ? $_POST['data_ingresso'] : null;              // DATE
```

---

### PONTO B — Incluir os campos no INSERT do banco
**Onde:** Linha **121** — essa é a linha atual:

```php
        $stmt_tea = $conexao->prepare("INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) VALUES (?, ?, ?, ?, ?)");
        $stmt_tea->bind_param("iiiss", $id_usuario, $id_profissional_logado, $id_responsavel_encontrado, $observacao, $nivel_tea);
```

**Substitua essas 2 linhas por:**

```php
        // INSERT com os 5 campos novos incluídos
        $stmt_tea = $conexao->prepare("INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea, anotacao_clinica, idade_diagnostico, indice_desenvolvimento, codigo_paciente, data_ingresso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        // iii = 3 inteiros (id_usuario, id_profissional, id_responsavel)
        // ss  = observacao(TEXT) e nivel_tea(VARCHAR) — string
        // s   = anotacao_clinica (TEXT)
        // i   = idade_diagnostico (INT)
        // d   = indice_desenvolvimento (FLOAT)
        // s   = codigo_paciente (VARCHAR)
        // s   = data_ingresso (DATE)
        $stmt_tea->bind_param("iiisssids",
            $id_usuario,
            $id_profissional_logado,
            $id_responsavel_encontrado,
            $observacao,
            $nivel_tea,
            $anotacao_clinica,        // s — TEXT (novo)
            $idade_diagnostico,       // i — INT (novo)
            $indice_desenvolvimento,  // d — FLOAT (novo)
            $codigo_paciente,         // s — VARCHAR (novo)
            $data_ingresso            // s — DATE (novo)
        );
```

> A linha 123 `$stmt_tea->execute();` e a 124 `$stmt_tea->close();` **não mudam**, ficam iguais.

---

## PASSO 4 — PHP de listagem
**Arquivo:** `php/pessoa_tea/pessoa_tea_get.php`

Há **2 SELECTs** neste arquivo (um com filtro por `?id` e outro sem). Você adiciona os mesmos campos nos dois.

**SELECT 1 — com filtro por ID (linha 9):**

A linha 9-10 atual é:
```php
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao 
```

**Substitua por:**
```php
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao,
                       P.anotacao_clinica, P.idade_diagnostico,
                       P.indice_desenvolvimento, P.codigo_paciente, P.data_ingresso
```

---

**SELECT 2 — sem filtro, lista todos (linha 17):**

A linha 17-18 atual é:
```php
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao 
```

**Substitua por:**
```php
        $sql = "SELECT U.id_usuario, U.nome, U.email, U.cpf, U.data_nascimento, 
                       P.nivel_tea, P.observacao,
                       P.anotacao_clinica, P.idade_diagnostico,
                       P.indice_desenvolvimento, P.codigo_paciente, P.data_ingresso
```

> Só adiciona 2 linhas em cada SELECT — o `FROM`, `JOIN`, `WHERE` e `ORDER BY` não mudam.

---

## PASSO 5 — JS de listagem (exibir na tabela)
**Arquivo:** `js/pessoa_tea.js/lista_pessoa_tea.js`

Você mexe em **2 pontos**.

---

### PONTO A — Adicionar cabeçalho na tabela (`<th>`)
**Onde:** Linha **56**, após `<th class="...">CPF</th>`.

A linha 56 atual é:
```javascript
                    <th class="text-secondary fw-semibold py-3">CPF</th>
```

**Substitua por:**
```javascript
                    <th class="text-secondary fw-semibold py-3">CPF</th>
                    <th class="text-secondary fw-semibold py-3">Dados Clínicos</th>
```

---

### PONTO B — Adicionar célula de dados (`<td>`) em cada linha
**Onde:** Linha **68**, após `<td class="text-muted">${tabela[i].cpf}</td>`.

A linha 68 atual é:
```javascript
                <td class="text-muted">${tabela[i].cpf}</td>
```

**Substitua por:**
```javascript
                <td class="text-muted">${tabela[i].cpf}</td>
                <td>
                    <!-- CAMPOS NOVOS PESSOA TEA exibidos na listagem -->
                    ${ tabela[i].codigo_paciente        ? `<small><b>Cód.:</b> ${tabela[i].codigo_paciente}</small><br>` : '' }
                    ${ tabela[i].idade_diagnostico      ? `<small><b>Diag.:</b> ${tabela[i].idade_diagnostico} anos</small><br>` : '' }
                    ${ tabela[i].indice_desenvolvimento ? `<small><b>Índice:</b> ${parseFloat(tabela[i].indice_desenvolvimento).toFixed(1)}</small><br>` : '' }
                    ${ tabela[i].data_ingresso          ? `<small><b>Ingresso:</b> ${new Date(tabela[i].data_ingresso + 'T00:00:00').toLocaleDateString('pt-BR')}</small>` : '' }
                </td>
```

> O `<td class="text-end pe-3">` com os botões de Ações que vem na sequência **não muda**.

# CRUD 7 — FEEDBACK

**Arquivos que você vai mexer:**
- `home/atividades/view_atividade_profissional.html` (ou onde fica o form de feedback)
- `js/atividade/view_atividade_profissional.js` (envio do feedback)
- `php/atividades/salvar_feedback.php` (PHP que salva)
- `php/atividades/atividade_submissoes.php` ou `atividade_detalhes.php` (PHP que lista)

---

## PASSO 3.1 — HTML do formulário de feedback
**Arquivo:** `home/atividades/view_atividade_profissional.html`

Procure onde está o `<textarea>` ou o `<input>` atual do campo de feedback (o campo `feedback` ou `textarea-feedback`). Adicione os campos novos **logo abaixo** dele, antes do botão de enviar:

```html
<!-- ============================================
     CAMPOS NOVOS — FEEDBACK (Autoria)
============================================ -->

<!-- CAMPO 1: TEXT — nota_feedback
     Texto livre adicional, diferente do feedback principal -->
<div class="mb-3 mt-3">
    <label for="nota_feedback" class="form-label fw-semibold">
        <i class="bi bi-journal-text me-1"></i> Nota Interna (TEXT)
    </label>
    <textarea id="nota_feedback"
              name="nota_feedback"
              class="form-control rounded-3"
              rows="2"
              placeholder="Nota interna sobre o desempenho..."></textarea>
</div>

<!-- CAMPO 2: INT — tentativas
     Quantas tentativas o paciente fez -->
<div class="mb-3">
    <label for="tentativas" class="form-label fw-semibold">
        <i class="bi bi-arrow-repeat me-1"></i> Número de Tentativas (INT)
    </label>
    <input type="number"
           id="tentativas"
           name="tentativas"
           class="form-control rounded-3"
           min="0" step="1"
           placeholder="Ex: 3" />
</div>

<!-- CAMPO 3: FLOAT — percentual_acerto
     Percentual de acerto, pode ter decimais (ex: 87.5) -->
<div class="mb-3">
    <label for="percentual_acerto" class="form-label fw-semibold">
        <i class="bi bi-percent me-1"></i> Percentual de Acerto (FLOAT)
    </label>
    <input type="number"
           id="percentual_acerto"
           name="percentual_acerto"
           class="form-control rounded-3"
           min="0" max="100" step="0.5"
           placeholder="Ex: 87.5" />
</div>

<!-- CAMPO 4: VARCHAR(50) — tag_feedback -->
<div class="mb-3">
    <label for="tag_feedback" class="form-label fw-semibold">
        <i class="bi bi-tag me-1"></i> Tag do Feedback (VARCHAR 50)
    </label>
    <input type="text"
           id="tag_feedback"
           name="tag_feedback"
           class="form-control rounded-3"
           maxlength="50"
           placeholder="Ex: Excelente, Precisa Melhorar..." />
</div>

<!-- CAMPO 5: DATE — data_prevista_retorno -->
<div class="mb-3">
    <label for="data_prevista_retorno" class="form-label fw-semibold">
        <i class="bi bi-calendar-check me-1"></i> Data Prevista de Retorno (DATE)
    </label>
    <input type="date"
           id="data_prevista_retorno"
           name="data_prevista_retorno"
           class="form-control rounded-3" />
</div>
<!-- FIM DOS CAMPOS NOVOS — FEEDBACK -->
```

---

## PASSO 3.2 — JS de envio do feedback
**Arquivo:** `js/atividade/view_atividade_profissional.js`

Procure onde é montado o `FormData` ou `body` para envio do feedback. Geralmente há um trecho:
```javascript
formData.append('feedback', feedbackTexto);
// ou
body: JSON.stringify({ feedback: ..., id_atividade: ..., id_pessoa_tea: ... })
```

Se usar **FormData**, adicione após o `append` do feedback principal:
```javascript
// =====================================================
// CAMPOS NOVOS — feedback — append no FormData
// =====================================================
formData.append('nota_feedback',         // TEXT
    document.getElementById('nota_feedback')?.value?.trim() || '');

formData.append('tentativas',            // INT
    document.getElementById('tentativas')?.value || '');

formData.append('percentual_acerto',     // FLOAT
    document.getElementById('percentual_acerto')?.value || '');

formData.append('tag_feedback',          // VARCHAR
    document.getElementById('tag_feedback')?.value?.trim() || '');

formData.append('data_prevista_retorno', // DATE
    document.getElementById('data_prevista_retorno')?.value || '');
```

---

## PASSO 3.3 — PHP de salvar feedback
**Arquivo:** `php/atividades/salvar_feedback.php`

**ONDE MEXER — PONTO A:** Captura de dados. Procure:
```php
$id_atividade = intval($_POST['id_atividade']);
$id_pessoa_tea = intval($_POST['id_pessoa_tea']);
$feedback = trim($_POST['feedback']);
```

**ADICIONE LOGO ABAIXO:**
```php
// =====================================================
// CAMPOS NOVOS — feedback — captura do POST
// =====================================================

// CAMPO TEXT: nota_feedback
$nota_feedback = trim($_POST['nota_feedback'] ?? '');
if ($nota_feedback === '') $nota_feedback = null;

// CAMPO INT: tentativas
$tentativas = isset($_POST['tentativas']) && $_POST['tentativas'] !== ''
              ? intval($_POST['tentativas']) : null;

// CAMPO FLOAT: percentual_acerto
$percentual_acerto = isset($_POST['percentual_acerto']) && $_POST['percentual_acerto'] !== ''
                     ? floatval($_POST['percentual_acerto']) : null;

// CAMPO VARCHAR: tag_feedback
$tag_feedback = trim($_POST['tag_feedback'] ?? '');
if ($tag_feedback === '') $tag_feedback = null;

// CAMPO DATE: data_prevista_retorno
$data_prevista_retorno = $_POST['data_prevista_retorno'] ?? null;
if ($data_prevista_retorno === '') $data_prevista_retorno = null;
```

**ONDE MEXER — PONTO B:** O UPDATE. Procure:
```php
    $stmt = $conexao->prepare("
        UPDATE PessoaTea_Atividade
        SET feedback_profissional = ?,
            data_feedback = NOW(),
            status_conclusao = 'Avaliada'
        WHERE id_atividade = ? AND id_pessoa_tea = ?
    ");
    $stmt->bind_param("sii", $feedback, $id_atividade, $id_pessoa_tea);
```

**SUBSTITUA por:**
```php
    // =====================================================
    // UPDATE com os 5 campos novos incluídos
    // Os campos ficam na tabela PessoaTea_Atividade
    // (as colunas foram adicionadas no SQL do início)
    // Tipos: s=string/text/varchar/date | i=int | d=float
    // =====================================================
    $stmt = $conexao->prepare("
        UPDATE PessoaTea_Atividade
        SET feedback_profissional   = ?,
            data_feedback           = NOW(),
            status_conclusao        = 'Avaliada',
            nota_feedback           = ?,   -- TEXT (novo)
            tentativas              = ?,   -- INT (novo)
            percentual_acerto       = ?,   -- FLOAT (novo)
            tag_feedback            = ?,   -- VARCHAR (novo)
            data_prevista_retorno   = ?    -- DATE (novo)
        WHERE id_atividade = ? AND id_pessoa_tea = ?
    ");
    // Ordem dos bind: feedback | nota_feedback | tentativas |
    //   percentual_acerto | tag_feedback | data_prevista_retorno |
    //   id_atividade | id_pessoa_tea
    $stmt->bind_param("ssidssii",
        $feedback,              // s — TEXT original
        $nota_feedback,         // s — TEXT novo
        $tentativas,            // i — INT novo
        $percentual_acerto,     // d — FLOAT novo
        $tag_feedback,          // s — VARCHAR novo
        $data_prevista_retorno, // s — DATE novo
        $id_atividade,          // i
        $id_pessoa_tea          // i
    );
```

---

## PASSO 3.4 — PHP de listagem (submissões/detalhes)
**Arquivo:** `php/atividades/atividade_detalhes.php` ou `atividade_submissoes.php`

Nos SELECTs que retornam dados da tabela `PessoaTea_Atividade`, adicione as colunas novas:
```sql
            pa.feedback_profissional,
            pa.data_feedback,
            -- CAMPOS NOVOS FEEDBACK --
            pa.nota_feedback,
            pa.tentativas,
            pa.percentual_acerto,
            pa.tag_feedback,
            pa.data_prevista_retorno,
```

No JS que exibe os detalhes do feedback, referencia essas propriedades pelo nome da coluna (`rel.nota_feedback`, `rel.tentativas`, etc.) nos templates HTML.

---

# RESUMO GERAL — O QUE VOCÊ MEXEU EM CADA CRUD

| CRUD | HTML Criar | JS Criar | PHP Criar | PHP Listar | JS Listar |
|---|---|---|---|---|---|
| **Atividade** | `publicar_atividade.html` | `publicar_atividade.js` | `criar_atividade.php` | `atividades_get.php` | `painel_atividades.js` |
| **Relatório** | `relatorio_responsavel.html` | `relatorio.js` | `relatorio_salvar.php` | `relatorios_listar.php` (2 arquivos) | `lista_relatorios.js` (2 arquivos) |
| **Feedback** | `view_atividade_profissional.html` | `view_atividade_profissional.js` | `salvar_feedback.php` | `atividade_detalhes.php` | JS do detalhe |
| **Profissional** | `cadastro_profissional.html` | `profissional_novo.js` | `usuario_novo.php` | `listar-profissionais.php` | `listar-profissionais.js` |
| **Responsável** | `cadastro_responsavel.html` | `responsavel_novo.js` | `usuario_novo.php` | `responsavel_get.php` | `lista_responsavel.js` |
| **Admin** | `cadastro_admin.html` | `admin_novo.js` | `usuario_novo.php` | `administrador_get.php` | `lista_admin.js` |

---

# CAMPOS POR CRUD — TABELA DE REFERÊNCIA RÁPIDA

| CRUD | Coluna TEXT | Coluna INT | Coluna FLOAT | Coluna VARCHAR | Coluna DATE |
|---|---|---|---|---|---|
| **Atividade** | `observacao_extra` | `nivel_dificuldade` | `pontuacao_maxima` | `codigo_atividade (30)` | `data_limite` |
| **Relatório** | `observacao_adicional` | `intensidade` | `duracao_horas` | `local_evento (100)` | `data_ocorrencia` |
| **Feedback** | `nota_feedback` | `tentativas` | `percentual_acerto` | `tag_feedback (50)` | `data_prevista_retorno` |
| **Profissional** | `biografia` | `anos_experiencia` | `valor_consulta` | `area_atuacao (80)` | `data_inicio_clinica` |
| **Responsável** | `observacao_responsavel` | `num_dependentes` | `renda_familiar` | `parentesco (50)` | `data_vinculo` |
| **Admin** | `bio_admin` | `nivel_acesso` | `percentual_meta` | `setor (60)` | `data_posse` |

---

# DICA FINAL — Como se localizar durante o teste de autoria

1. **No banco de dados:** cada campo tem um nome único e um `COMMENT` descritivo. Use `DESCRIBE Atividade;` para ver os campos.
2. **No HTML:** busque pelo nome do campo (ex: `id="observacao_extra"`) para achar onde ele está no formulário.
3. **No PHP:** busque por `$_POST['observacao_extra']` para achar onde é capturado, e `observacao_extra` no SQL para ver onde é salvo/lido.
4. **No JS:** busque por `observacao_extra` no template literal para ver onde é exibido.
5. **Cada campo sempre aparece em 4 lugares:** HTML (form), JS (append/FormData), PHP criar (POST + INSERT/UPDATE), PHP listar (SELECT) + JS listar (template).
