CREATE DATABASE lumind_db;
USE lumind_db;

-- =====================================================
-- TABELA PRINCIPAL: CLIENTE (dados comuns a todos)
-- =====================================================
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, 
    instagram VARCHAR(100),
    nivel ENUM('adm', 'responsavel', 'profissional', 'pessoa_tea') DEFAULT 'pessoa_tea',
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA ESPECÍFICA: PROFISSIONAL (dados de saúde)
-- =====================================================
CREATE TABLE profissional (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    registro_profissional VARCHAR(50) NOT NULL,
    telefone VARCHAR(20),
    data_nascimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA ESPECÍFICA: PESSOA_TEA
-- =====================================================
CREATE TABLE pessoa_tea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    data_diagnostico DATE,
    nivel_autismo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA ESPECÍFICA: RESPONSAVEL
-- =====================================================
CREATE TABLE responsavel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    tipo_responsabilidade VARCHAR(100),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA ESPECÍFICA: ADM
-- =====================================================
CREATE TABLE adm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    departamento VARCHAR(100),
    permissoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================
INSERT INTO cliente (nome, email, usuario, senha, instagram, nivel, ativo) 
VALUES 
('João Admin', 'joao@gmail.com', 'joao_oficial', '123456', 'joao_insta', 'adm', 1),
('Gabriela Prof', 'gabi@gmail.com', 'gabi_tea', '123456', 'gabi_tea_suporte', 'profissional', 1),
('Yasmin User', 'yasmin@gmail.com', 'yasmin_luz', '123456', 'yasmin.luz', 'pessoa_tea', 1),
('Heitor Resp', 'heitor@gmail.com', 'heitor_dev', '123456', 'heitordev', 'responsavel', 1);

-- Dados para profissional (Gabriela)
INSERT INTO profissional (cliente_id, especialidade, registro_profissional, telefone, data_nascimento)
VALUES (2, 'psicologia', 'CRP 06/123456', '(11) 98765-4321', '1990-05-15');

-- Dados para admin (João)
INSERT INTO adm (cliente_id)
VALUES (1);