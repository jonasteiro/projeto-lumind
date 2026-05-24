-- =======================================================
-- 1. CRIAÇÃO E SELEÇÃO DO BANCO DE DADOS
-- =======================================================
CREATE DATABASE IF NOT EXISTS lumind_db;
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
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- =======================================================
-- 3. TABELAS DE PERFIS (Ordem de Dependência Corrigida)
-- =======================================================
CREATE TABLE Administrador (
    id_usuario INT NOT NULL,
    status_adm BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- ProfissionalSaude DEVE vir antes, pois outras tabelas dependem dela
CREATE TABLE ProfissionalSaude (
    id_usuario INT NOT NULL,
    registro_profissional VARCHAR(30) NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE ResponsavelLegal (
    id_usuario INT NOT NULL,
    id_profissional INT NOT NULL, -- ALERTA DE ARQUITETURA: Reconsidere essa necessidade.
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
-- 4. TABELAS DE FUNCIONALIDADES E REGRAS DE NEGÓCIO
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
-- 5. TABELAS PIVÔ (Relacionamentos N:M)
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
-- 6. CARGA INICIAL DE DADOS (Corrigindo Ordem e Constraints)
-- =======================================================

-- 1. Admin
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (1, 'Carlos Sistema', 'admin@lumind.com.br', 'senha_123', '11111111111', '1985-04-12', 'Administrador');
INSERT INTO Administrador (id_usuario, status_adm) VALUES (1, TRUE);

-- 2. Profissional de Saúde (Precisa existir antes do responsável referenciá-lo)
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (3, 'Dr. Roberto Mendes', 'roberto.neuro@clinica.com', 'senha_789', '33333333333', '1975-11-03', 'ProfissionalSaude');
INSERT INTO ProfissionalSaude (id_usuario, registro_profissional, especialidade) 
VALUES (3, 'CRM-98765', 'Neurologista Pediátrico');

-- 3. Responsável Legal (Agora apontando para o Médico ID 3)
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (2, 'Marta Oliveira', 'marta.mae@email.com', 'senha_456', '22222222222', '1980-08-25', 'ResponsavelLegal');
INSERT INTO ResponsavelLegal (id_usuario, id_profissional) VALUES (2, 3);

-- 4. Pessoa TEA (Apontando para Médico ID 3 e Responsável ID 2)
INSERT INTO Usuario (id_usuario, nome, email, senha, cpf, data_nascimento, tipo_usuario) 
VALUES (4, 'Lucas Oliveira', 'lucas.filho@email.com', 'senha_000', '44444444444', '2010-02-15', 'PessoaTea');
INSERT INTO PessoaTea (id_usuario, id_profissional, id_responsavel, observacao, nivel_tea) 
VALUES (4, 3, 2, 'Apresenta forte sensibilidade a ruídos...', 'Nível 2 - Suporte Substancial');