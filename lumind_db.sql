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
VALUES (1, 'Admin Master', 'admin@lumind.com', 'hash_admin', '11111111111', '1990-01-01', 'Administrador');
INSERT INTO Administrador (id_usuario, status_adm) VALUES (1, TRUE);

-- -------------------------------------------------------
-- USUÁRIO 2: Profissional de Saúde - APROVADO
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (2, 'Dra. Alice Neuro', 'alice@clinica.com', 'hash_alice', '22222222222', '1985-05-15', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (2, 'CRM-12345', 'Neurologia Integrativa');
-- Doc validada pelo Admin (ID 1)
INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao, id_admin_revisor, data_revisao) 
VALUES (2, 'blob_cert', 'blob_rg', 'Aprovado', 1, NOW());

-- -------------------------------------------------------
-- USUÁRIO 3: Profissional de Saúde - REPROVADO
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (3, 'Dr. Bruno Fono', 'bruno@clinica.com', 'hash_bruno', '33333333333', '1988-08-20', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (3, 'CRFA-9876', 'Fonoaudiologia');
-- Doc rejeitada pelo Admin (ID 1) com motivo
INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao, motivo_reprovacao, id_admin_revisor, data_revisao) 
VALUES (3, 'blob_cert_borrado', 'blob_rg_vencido', 'Reprovado', 'CRFA ilegível e documento de identidade vencido.', 1, NOW());

-- -------------------------------------------------------
-- USUÁRIO 4: Profissional de Saúde - PENDENTE
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (4, 'Dra. Carla Psico', 'carla@clinica.com', 'hash_carla', '44444444444', '1992-11-10', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (4, 'CRP-55443', 'Psicologia Infantil');
-- Doc aguardando análise (sem revisor, sem data de revisão)
INSERT INTO Documentacao (id_usuario, certificacao_profissional, carteira_identidade_nacional, status_aprovacao) 
VALUES (4, 'blob_cert_novo', 'blob_rg_novo', 'Aguardando');

-- -------------------------------------------------------
-- USUÁRIO 5: Responsável Legal (Mãe)
-- VINCULADO: Obrigatoriamente à Dra. Alice (ID 2)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (5, 'Marta Silva', 'marta@mae.com', 'hash_marta', '55555555555', '1980-03-22', 'ResponsavelLegal');
INSERT INTO ResponsavelLegal (id_usuario, id_profissional) 
VALUES (5, 2);

-- -------------------------------------------------------
-- USUÁRIO 6: Paciente (Pessoa TEA)
-- VINCULADO: Dra. Alice (ID 2) e Mãe Marta (ID 5)
-- -------------------------------------------------------
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (6, 'Lucas Silva', 'lucas@filho.com', 'hash_lucas', '66666666666', '2015-07-30', 'PessoaTea');
INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) 
VALUES (6, 2, 5, 'Comunicação não verbal, sensibilidade auditiva moderada.', 'Nível 3');