-- =======================================================
-- 1. CRIAÇÃO E SELEÇÃO DO BANCO DE DADOS
-- =======================================================
CREATE DATABASE lumind_db;
USE lumind_db;

-- =======================================================
-- 2. TABELAS BASE (Entidades Principais)
-- =======================================================
CREATE TABLE Usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_usuario)
);

CREATE TABLE Telefone (
    id_telefone INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    PRIMARY KEY (id_telefone),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =======================================================
-- 3. TABELAS DE PERFIS (Especializações de Usuário)
-- =======================================================
CREATE TABLE Administrador (
    id_usuario INT NOT NULL,
    status_adm BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE ResponsavelLegal (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, -- Vínculo com quem cadastrou
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario)
);

CREATE TABLE ProfissionalSaude (
    id_usuario INT NOT NULL,
    registro_profissional VARCHAR(30) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE ResponsavelLegal (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, -- Vínculo com quem cadastrou
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario)
);

CREATE TABLE PessoaTea (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, -- Vínculo com o profissional que atende
    id_responsavel INT NOT NULL,  -- Vínculo com o responsável legal
    id_profissional INT NOT NULL, -- Vínculo com o profissional que atende
    id_responsavel INT NOT NULL,  -- Vínculo com o responsável legal
    observacao TEXT NULL,
    nivel_tea VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario),
    FOREIGN KEY (id_responsavel) REFERENCES ResponsavelLegal(id_usuario)
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario),
    FOREIGN KEY (id_responsavel) REFERENCES ResponsavelLegal(id_usuario)
);

-- =======================================================
-- 4. TABELAS DE FUNCIONALIDADES E REGRAS DE NEGÓCIO
-- =======================================================
CREATE TABLE Documentacao (
    id_documentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, 
    
    -- Arquivos
    certificacao_profissional MEDIUMBLOB NOT NULL,
    carteira_identidade_nacional MEDIUMBLOB NOT NULL,
    
    -- Aprovação
    status_aprovacao ENUM('Aguardando', 'Aprovado', 'Reprovado') DEFAULT 'Aguardando',
    motivo_reprovacao TEXT,
    id_admin_revisor INT, 
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_revisao DATETIME,

    CONSTRAINT fk_doc_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_doc_admin FOREIGN KEY (id_admin_revisor) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Atividade (
    id_atividade INT NOT NULL AUTO_INCREMENT,
    id_profissional INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_publicacao DATE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_atividade),
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario)
);

CREATE TABLE Evento (
    id_evento INT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    local VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    PRIMARY KEY (id_evento)
);

CREATE TABLE Relatorio (
    id_relatorio INT NOT NULL AUTO_INCREMENT,
    id_responsavel INT NOT NULL,
    id_pessoa_tea INT NOT NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    PRIMARY KEY (id_relatorio),
    FOREIGN KEY (id_responsavel) REFERENCES ResponsavelLegal(id_usuario),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario)
);

-- =======================================================
-- 5. TABELAS PIVÔ (Relacionamentos N:M)
-- =======================================================
CREATE TABLE PessoaTea_Atividade (
    id_pessoa_tea INT NOT NULL,
    id_atividade INT NOT NULL,
    PRIMARY KEY (id_pessoa_tea, id_atividade),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario),
    FOREIGN KEY (id_atividade) REFERENCES Atividade(id_atividade)
);

-- Vínculo entre ResponsavelLegal e PessoaTea (Um responsável pode cuidar de vários pacientes)
CREATE TABLE ResponsavelLegal_PessoaTea (
    id_responsavel INT NOT NULL,
    id_pessoa_tea INT NOT NULL,
    PRIMARY KEY (id_responsavel, id_pessoa_tea),
    FOREIGN KEY (id_responsavel) REFERENCES ResponsavelLegal(id_usuario),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario)
);

CREATE TABLE PessoaTea_Evento (
    id_pessoa_tea INT NOT NULL,
    id_evento INT NOT NULL,
    PRIMARY KEY (id_pessoa_tea, id_evento),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento)
);

-- =======================================================
-- 6. CARGA INICIAL DE DADOS (INSERTS PARA TESTES)
-- =======================================================

-- -------------------------------------------------------
-- USUÁRIO 1: Administrador
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (1, 'Carlos Sistema', 'admin@lumind.com.br', 'senha_hasheada_123', '11111111111', '1985-04-12', 'Administrador');

INSERT INTO Administrador (id_usuario, status_adm) 
VALUES (1, TRUE);

-- -------------------------------------------------------
-- USUÁRIO 3: Profissional de Saúde (Cadastro Aprovado)
-- (inserido antes do Responsável Legal pois ResponsavelLegal.id_profissional referencia esta tabela)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (3, 'Dr. Roberto Mendes', 'roberto.neuro@clinica.com', 'senha_hasheada_789', '33333333333', '1975-11-03', 'ProfissionalSaude');

INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (3, 'CRM-98765', 'Neurologista Pediátrico');

INSERT INTO Documentacao (id_usuario, carteira_identidade_nacional, certificacao_profissional, status_aprovacao)
VALUES (3, 0x504C414345484F4C444552, 0x504C414345484F4C444552, 'Aprovado');

-- -------------------------------------------------------
-- USUÁRIO 2: Responsável Legal
-- (inserido depois do Profissional pois depende de ProfissionalSaude via FK id_profissional)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (2, 'Marta Oliveira', 'marta.mae@email.com', 'senha_hasheada_456', '22222222222', '1980-08-25', 'ResponsavelLegal');

INSERT INTO ResponsavelLegal (id_usuario, id_profissional) 
VALUES (2, 3);

-- -------------------------------------------------------
-- USUÁRIO 4: Paciente (Pessoa TEA)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (4, 'Lucas Oliveira', 'lucas.filho@email.com', 'senha_hasheada_000', '44444444444', '2010-02-15', 'PessoaTea');

INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) 
VALUES (4, 3, 2, 'Apresenta forte sensibilidade a ruídos agudos. Responde bem a estímulos visuais.', 'Nível 2 - Suporte Substancial');

-- -------------------------------------------------------
-- USUÁRIO 5: Profissional de Saúde (Cadastro Pendente)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (5, 'Dra. Fernanda Lima', 'fernanda.psico@clinica.com', 'senha_hasheada_111', '55555555555', '1988-06-20', 'ProfissionalSaude');

INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (5, 'CRP-12345', 'Psicóloga Infantil');

INSERT INTO Documentacao (id_usuario, carteira_identidade_nacional, certificacao_profissional, status_aprovacao)
VALUES (5, 0x504C414345484F4C444552, 0x504C414345484F4C444552, 'Aguardando');

-- -------------------------------------------------------
-- USUÁRIO 6: Profissional de Saúde (Cadastro Reprovado)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (6, 'Dr. Paulo Ricardo', 'paulo.fono@clinica.com', 'senha_hasheada_222', '66666666666', '1990-09-10', 'ProfissionalSaude');

INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (6, 'CRFA-54321', 'Fonoaudiólogo');

INSERT INTO Documentacao (id_usuario, carteira_identidade_nacional, certificacao_profissional, status_aprovacao, motivo_reprovacao)
VALUES (6, 0x504C414345484F4C444552, 0x504C414345484F4C444552, 'Reprovado', 'Documento do conselho regional ilegível. Por favor, reenvie uma foto mais nítida.');

-- /Acessar o painel de atividades Gaby/
-- 1. Criando uma atividade para o Dr. Roberto (ID 3)
INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria)
VALUES (3, 'Exercício de Foco Visual', 'Seguir a bolinha vermelha na tela', '2023-10-25', 'Cognitiva');

-- 2. Vinculando essa atividade ao paciente Lucas (ID 4)
INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade)
VALUES (4, 1);

-- 3. Criando mais atividades para teste
INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria)
VALUES 
  (3, 'Exercício de Motricidade Fina', 'Práticas com quebra-cabeças e peças pequenas', '2023-10-26', 'Motricidade'),
  (3, 'Atividade de Fala e Comunicação', 'Pronunciar as letras do alfabeto com clareza', '2023-10-27', 'Fonoaudiologia'),
  (5, 'Relaxamento e Mindfulness', 'Técnicas de respiração e relaxamento muscular', '2023-10-28', 'Psicologia');

-- 4. Vinculando todas as atividades ao Lucas (ID 4)
INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade)
VALUES 
  (4, 2),
  (4, 3),
  (4, 4);

-- Query A exemplo buscando atividades do Dr. Roberto (ID 3)
SELECT id_atividade, titulo, categoria, data_publicacao 
FROM Atividade 
WHERE id_profissional = 3 
ORDER BY data_publicacao DESC;

-- Query B exemplo buscando atividades atribuídas ao Lucas (ID 4)
SELECT a.id_atividade, a.titulo, a.categoria, a.data_publicacao 
FROM Atividade a 
INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade 
WHERE pa.id_pessoa_tea = 4 
ORDER BY a.data_publicacao DESC;

-- 5. Vincular responsável Marta (id 2) ao paciente Lucas (id 4)
INSERT INTO ResponsavelLegal_PessoaTea (id_responsavel, id_pessoa_tea)
VALUES (2, 4);

-- =======================================================
-- MIGRATIONS — Sprint 2 (PBI 04 + PBI 05)
-- Executar na ordem abaixo em todos os ambientes
-- (Local, Homologação, Produção)
-- =======================================================
 
 
-- -------------------------------------------------------
-- PBI 04 — Adiciona suporte a arquivo anexo na Atividade
-- -------------------------------------------------------
ALTER TABLE Atividade
    ADD COLUMN arquivo_anexo MEDIUMBLOB  NULL AFTER categoria,
    ADD COLUMN tipo_arquivo  VARCHAR(50) NULL AFTER arquivo_anexo;
-- Exemplos de valor para tipo_arquivo: 'image/jpeg', 'image/png', 'application/pdf'
 
 
-- -------------------------------------------------------
-- PBI 05 — Adiciona controle de conclusão na tabela pivô
-- -------------------------------------------------------
ALTER TABLE PessoaTea_Atividade
    ADD COLUMN status_conclusao    VARCHAR(20)  NOT NULL DEFAULT 'Pendente'
                                   COMMENT 'Pendente | Concluída'
                                   AFTER id_atividade,
 
    ADD COLUMN comentario_paciente TEXT         NULL
                                   COMMENT 'Comentário opcional do paciente ao concluir'
                                   AFTER status_conclusao,
 
    ADD COLUMN data_conclusao      DATETIME     NULL
                                   COMMENT 'Data e hora do último envio/atualização'
                                   AFTER comentario_paciente;
 
 
-- -------------------------------------------------------
-- VERIFICAÇÃO — confirme que as colunas existem
-- -------------------------------------------------------
-- DESCRIBE Atividade;
-- DESCRIBE PessoaTea_Atividade;

-- -------------------------------------------------------
-- FEEDBACK DO PROFISSIONAL — Adiciona suporte a feedback
-- -------------------------------------------------------
ALTER TABLE PessoaTea_Atividade
    ADD COLUMN feedback_profissional TEXT         NULL
                                     COMMENT 'Feedback/avaliação do profissional sobre a atividade'
                                     AFTER data_conclusao,
    ADD COLUMN data_feedback         DATETIME     NULL
                                     COMMENT 'Data e hora quando o profissional enviou o feedback'
                                     AFTER feedback_profissional;
