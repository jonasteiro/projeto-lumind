CREATE DATABASE lumind_db;
USE lumind_db;

CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, 
    instagram VARCHAR(100),
    ativo TINYINT(1) DEFAULT 1
);

INSERT INTO cliente (nome, email, usuario, senha, instagram, ativo) 
VALUES 
('João', 'joao@gmail.com', 'joao_oficial', '123456', 'joao_insta', 1),
('Gabriela', 'gabi@gmail.com', 'gabi_tea', '123456', 'gabi_tea_suporte', 1),
('Yasmin', 'yasmin@gmail.com', 'yasmin_luz', '123456', 'yasmin.luz', 1),
('Heitor', 'heitor@gmail.com', 'heitor_dev', '123456', 'heitordev', 1);