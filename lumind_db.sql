-- =======================================================
-- 1. PREPARAÇÃO DO AMBIENTE
-- =======================================================
DROP DATABASE IF EXISTS lumind_db;
CREATE DATABASE lumind_db;
USE lumind_db;

-- =======================================================
-- 2. TABELAS BASE
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

CREATE TABLE RecuperacaoSenha (
    id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(6) NOT NULL,
    data_expiracao DATETIME NOT NULL
);

CREATE TABLE Telefone (
    id_telefone INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    PRIMARY KEY (id_telefone),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- =======================================================
-- 3. TABELAS DE PERFIS (ORDEM RIGOROSA DE COMPILAÇÃO)
-- =======================================================
CREATE TABLE Administrador (
    id_usuario INT NOT NULL,
    status_adm BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE ProfissionalSaude (
    id_usuario INT NOT NULL,
    registro_profissional VARCHAR(30) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE ResponsavelLegal (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, 
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario)
);

CREATE TABLE PessoaTea (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, 
    id_responsavel INT NOT NULL,  
    observacao TEXT NULL,
    nivel_tea VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_profissional) REFERENCES ProfissionalSaude(id_usuario),
    FOREIGN KEY (id_responsavel) REFERENCES ResponsavelLegal(id_usuario)
);

-- =======================================================
-- 4. TABELAS DE FUNCIONALIDADES
-- =======================================================
CREATE TABLE Documentacao (
    id_documentacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, 
    certificacao_profissional MEDIUMBLOB NOT NULL,
    carteira_identidade_nacional MEDIUMBLOB NOT NULL,
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
-- 5. TABELAS PIVÔ (N:M)
-- =======================================================
CREATE TABLE PessoaTea_Atividade (
    id_pessoa_tea INT NOT NULL,
    id_atividade INT NOT NULL,
    PRIMARY KEY (id_pessoa_tea, id_atividade),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario),
    FOREIGN KEY (id_atividade) REFERENCES Atividade(id_atividade)
);

CREATE TABLE PessoaTea_Evento (
    id_pessoa_tea INT NOT NULL,
    id_evento INT NOT NULL,
    PRIMARY KEY (id_pessoa_tea, id_evento),
    FOREIGN KEY (id_pessoa_tea) REFERENCES PessoaTea(id_usuario),
    FOREIGN KEY (id_evento) REFERENCES Evento(id_evento)
);

-- =======================================================
-- 6. MASSA DE DADOS PARA HOMOLOGAÇÃO (INSERTS)
-- =======================================================

-- -------------------------------------------------------
-- USUÁRIO 1: Administrador (Sistema)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (1, 'Admin Master', 'admin@lumind.com', '$2a$12$rALjqYABiVGVSirn.cwUEeY0bVXOcwTVlua9i92xnlIiRYW68cgEm', '11111111111', '1990-01-01', 'Administrador');
INSERT INTO Administrador (id_usuario, status_adm) VALUES (1, TRUE);
-- Senha admin: Admin@1234

-- -------------------------------------------------------
-- USUÁRIO 2: Profissional de Saúde - APROVADO
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (2, 'Dra. Alice Neuro', 'alice@clinica.com', '$2a$12$MG4/i/coqSh0nqavX6Igvu1d3VG7DNALqgClx1JewL2F.uF.ZPL3O', '22222222222', '1985-05-15', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (2, 'CRM-12345', 'Neurologia Integrativa');
-- Senha Alice: Alice@1234

INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao, id_admin_revisor, data_revisao) 
VALUES (2, 'blob_cert', 'blob_rg', 'Aprovado', 1, NOW());

-- -------------------------------------------------------
-- USUÁRIO 3: Profissional de Saúde - REPROVADO
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (3, 'Dr. Bruno Fono', 'bruno@clinica.com', '$2a$12$glpeXYOr1aZigDI1ZRK6FevvNto3sa2ecgQX4hK1PUmfsKc1ikVje', '33333333333', '1988-08-20', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (3, 'CRFA-9876', 'Fonoaudiologia');
-- Senha Bruno: Bruno@1234

INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao, motivo_reprovacao, id_admin_revisor, data_revisao) 
VALUES (3, 'blob_cert_borrado', 'blob_rg_vencido', 'Reprovado', 'CRFA ilegível e documento de identidade vencido.', 1, NOW());

-- -------------------------------------------------------
-- USUÁRIO 4: Profissional de Saúde - PENDENTE
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (4, 'Dra. Carla Psico', 'carla@clinica.com', '$2a$12$QPrgqat9hpce6qoFwZ.zouoPifIjzJfdfxxVnzrpf3NgVHfQHMIxq', '44444444444', '1992-11-10', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (4, 'CRP-55443', 'Psicologia Infantil');
-- Senha Carla: Carla@1234

INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao) 
VALUES (4, 'blob_cert_novo', 'blob_rg_novo', 'Aguardando');

-- -------------------------------------------------------
-- USUÁRIO 5: Responsável Legal (Mãe)
-- VINCULADO: Obrigatoriamente à Dra. Alice (ID 2)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (5, 'Marta Silva', 'marta@mae.com', '$2a$12$TbroNLKR0vUiPS7bwWBeXesTAB/C8M2q7js0R.yAemGz5nHPuVb.W', '55555555555', '1980-03-22', 'ResponsavelLegal');
INSERT INTO ResponsavelLegal (id_usuario, id_profissional) 
VALUES (5, 2);
-- Senha Marta: Marta@1234

-- -------------------------------------------------------
-- USUÁRIO 6: Paciente (Pessoa TEA)
-- VINCULADO: Dra. Alice (ID 2) e Mãe Marta (ID 5)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (6, 'Lucas Silva', 'lucas@filho.com', '$2a$12$ZSHYwiA1vNPs58wQLUOdrOHatKESHv82rgTX0fNHGI3WxPvUo56fm', '66666666666', '2015-07-30', 'PessoaTea');
INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) 
VALUES (6, 2, 5, 'Comunicação não verbal, sensibilidade auditiva moderada.', 'Nível 3');
-- Senha Lucas: Lucas@1234

-- =======================================================
-- 7. MASSA DE DADOS - ATIVIDADES (GABY)
-- =======================================================

-- 1. Criando uma atividade para o Dr. Roberto/Bruno (ID 3)
INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria)
VALUES (3, 'Exercício de Foco Visual', 'Seguir a bolinha vermelha na tela', '2023-10-25', 'Cognitiva');

-- 2. Vinculando essa atividade ao paciente Lucas (Correção: O id do Lucas é 6, não 4)
INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade)
VALUES (6, 1);

-- 3. Criando mais atividades para teste
INSERT INTO Atividade (id_profissional, titulo, descricao, data_publicacao, categoria)
VALUES
(3, 'Exercício de Motricidade Fina', 'Práticas com quebra-cabeças e peças pequenas', '2023-10-26', 'Motricidade'),
(3, 'Atividade de Fala e Comunicação', 'Pronunciar as letras do alfabeto com clareza', '2023-10-27', 'Fonoaudiologia'),
(2, 'Relaxamento e Mindfulness', 'Técnicas de respiração e relaxamento muscular', '2023-10-28', 'Psicologia'); -- Correção: Alterado de 5 para 2 (Profissional válido)

-- 4. Vinculando todas as atividades ao Lucas (Correção: id 6)
INSERT INTO PessoaTea_Atividade (id_pessoa_tea, id_atividade)
VALUES
(6, 2),
(6, 3),
(6, 4);

-- Query A exemplo buscando atividades do Dr. Roberto (ID 3)
-- SELECT id_atividade, titulo, categoria, data_publicacao FROM Atividade WHERE id_profissional = 3 ORDER BY data_publicacao DESC;

-- Query B exemplo buscando atividades atribuídas ao Lucas (ID 6)
-- SELECT a.id_atividade, a.titulo, a.categoria, a.data_publicacao FROM Atividade a INNER JOIN PessoaTea_Atividade pa ON a.id_atividade = pa.id_atividade WHERE pa.id_pessoa_tea = 6 ORDER BY a.data_publicacao DESC;

-- 5. Vincular responsável Marta ao paciente Lucas
-- ATENÇÃO: A tabela ResponsavelLegal_PessoaTea não existe neste banco. O vínculo já é feito na própria tabela PessoaTea na coluna id_responsavel.
-- INSERT INTO ResponsavelLegal_PessoaTea (id_responsavel, id_pessoa_tea) VALUES (2, 4);

-- =======================================================
-- 8. MIGRATIONS — Sprint 2 (PBI 04 + PBI 05) - GABY
-- =======================================================

-- -------------------------------------------------------
-- PBI 04 — Adiciona suporte a arquivo anexo na Atividade
-- -------------------------------------------------------
ALTER TABLE Atividade
    ADD COLUMN arquivo_anexo MEDIUMBLOB NULL AFTER categoria,
    ADD COLUMN tipo_arquivo VARCHAR(50) NULL AFTER arquivo_anexo;

-- -------------------------------------------------------
-- PBI 05 — Adiciona controle de conclusão na tabela pivô
-- -------------------------------------------------------
ALTER TABLE PessoaTea_Atividade
    ADD COLUMN status_conclusao VARCHAR(20) NOT NULL DEFAULT 'Pendente'
    COMMENT 'Pendente | Concluída'
    AFTER id_atividade,

    ADD COLUMN comentario_paciente TEXT NULL
    COMMENT 'Comentário opcional do paciente ao concluir'
    AFTER status_conclusao,

    ADD COLUMN data_conclusao DATETIME NULL
    COMMENT 'Data e hora do último envio/atualização'
    AFTER comentario_paciente;

-- -------------------------------------------------------
-- FEEDBACK DO PROFISSIONAL
-- -------------------------------------------------------
ALTER TABLE PessoaTea_Atividade
    ADD COLUMN feedback_profissional TEXT NULL
    COMMENT 'Feedback/avaliação do profissional sobre a atividade'
    AFTER data_conclusao,

    ADD COLUMN data_feedback DATETIME NULL
    COMMENT 'Data e hora quando o profissional enviou o feedback'
    AFTER feedback_profissional;
    
ALTER TABLE PessoaTea_Atividade
ADD COLUMN arquivo_resposta LONGTEXT NULL,
ADD COLUMN tipo_arquivo_resposta VARCHAR(50) NULL;