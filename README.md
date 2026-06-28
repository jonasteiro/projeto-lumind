<div align="center">

# 🧠 Lumind
### Tecnologia Inclusiva e Gestão para o Espectro Autista (TEA)

> *"Projetando soluções com empatia, acessibilidade e engenharia de software inclusiva."*

<br/>

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green?style=for-the-badge)
![PUCPR](https://img.shields.io/badge/PUCPR-Engenharia%20de%20Software-blue?style=for-the-badge)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Princípios de Acessibilidade](#-princípios-de-acessibilidade-a11y)
- [Funcionalidades](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#️-como-executar-o-projeto-localmente)
- [Contribuição](#-contribuição)

---

## 💡 Sobre o Projeto

O **Lumind** é uma plataforma web de gestão desenvolvida com foco empático para apoiar pessoas com **Transtorno do Espectro Autista (TEA)** e suas redes de apoio — familiares, cuidadores e profissionais de saúde.

Nascido como solução para a disciplina de *Experiência Criativa: Projetando Soluções Computacionais*, o sistema organiza informações críticas de prontuários de forma **acessível, segura e confortável**, operando com uma interface assíncrona de baixo impacto sensorial.

O Lumind não é apenas um CRUD; é uma decisão arquitetural onde cada componente de UI foi escolhido para reduzir a carga cognitiva e a ansiedade na interação com software.

---

## ♿ Princípios de Acessibilidade (a11y)

A interface foi projetada sob rigorosos critérios de acessibilidade, reconhecendo que pessoas no espectro frequentemente enfrentam desafios com sobrecarga sensorial:

| Princípio | Implementação |
|---|---|
| **Baixo Contraste Sensorial** | Paletas neutras (tons sálvia e fundos brancos) para evitar fadiga visual |
| **Interface Limpa (Clean UI)** | Remoção de animações desnecessárias e elementos que causam distração |
| **Navegação Previsível** | Estruturas lógicas claras e feedback imediato para reduzir ansiedade |
| **Semântica HTML5** | Uso correto de tags semânticas para compatibilidade com leitores de tela |

---

## 🚀 Funcionalidades Principais

- 🔐 **Autenticação Segura** — Login com validação de sessão PHP e feedback visual claro de erros
- 📊 **Painel de Controle (Dashboard)** — Visualização em formato *Data Grid* limpo para leitura de registros e perfis ativos
- 👤 **Gestão de Pacientes (CRUD)** — Formulários com *Floating Labels* e *Toggle Switches* para cadastro e atualização de prontuários
- ⚡ **Processamento Assíncrono** — Requisições via Fetch API (AJAX) que preservam a estabilidade visual, sem recarregamentos abruptos de página

---

## 🛠️ Tecnologias Utilizadas

### Front-end
| Tecnologia | Versão | Função |
|---|---|---|
| HTML5 Semântico | — | Estrutura e acessibilidade |
| CSS3 Modular | — | Estilização customizada |
| JavaScript Vanilla | ES6+ | Lógica de UI e Fetch API |
| Bootstrap | 5.3 | Grid responsivo e componentes |
| Bootstrap Icons | 1.x | Iconografia da interface |

### Back-end & Banco de Dados
| Tecnologia | Versão | Função |
|---|---|---|
| PHP | 8+ | Regras de negócio, sessões e API interna |
| MySQL | 8.x | Persistência relacional de prontuários |
| Apache | 2.4+ | Servidor HTTP local |

---

## 📁 Arquitetura do Projeto

```
projeto-lumind/
│
├── login/
│   └── index.html          # Ponto de entrada da aplicação
│
├── dashboard/              # Painel de controle principal
│
├── assets/
│   ├── css/                # Folhas de estilo modulares
│   ├── js/                 # Scripts JavaScript (Fetch API, UI)
│   └── img/                # Imagens e ícones
│
├── api/                    # Endpoints PHP (back-end)
│   └── *.php
│
├── config/
│   └── connection.php      # Configuração da conexão com o banco
│
└── database.sql            # Script de dump para criação das tabelas
```

> ⚠️ **Nota:** A estrutura acima é uma representação baseada no padrão do projeto. Verifique o repositório para confirmar os caminhos exatos.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de que sua máquina possui os seguintes itens instalados:

- **Git** — [git-scm.com](https://git-scm.com/)
- **Ambiente de Servidor Local** com Apache + MySQL + PHP 8+. Recomendamos uma das opções abaixo:

| Ambiente | Sistema Operacional | Link |
|---|---|---|
| **XAMPP** | Windows / Linux / macOS | [apachefriends.org](https://www.apachefriends.org/) |
| **Laragon** | Windows | [laragon.org](https://laragon.org/) |
| **WAMP** | Windows | [wampserver.com](https://www.wampserver.com/) |

---

## ⚙️ Como Executar o Projeto Localmente

Siga o passo a passo abaixo em ordem. O processo leva menos de 5 minutos.

### Passo 1 — Clonar o Repositório

Abra seu terminal e execute:

```bash
git clone https://github.com/jonasteiro/projeto-lumind.git
```

### Passo 2 — Mover para o Diretório do Servidor

Mova a pasta clonada para o diretório público do seu servidor local:

```bash
# Exemplo para XAMPP no Windows
mv projeto-lumind C:/xampp/htdocs/

# Exemplo para XAMPP no Linux/macOS
mv projeto-lumind /opt/lampp/htdocs/
```

### Passo 3 — Iniciar os Serviços

No painel de controle do seu ambiente (ex: XAMPP Control Panel), inicie os serviços:

- ✅ **Apache** → Start
- ✅ **MySQL** → Start

### Passo 4 — Configurar o Banco de Dados

1. Acesse o gerenciador de banco de dados no navegador:

```
http://localhost/phpmyadmin
```

2. Crie um novo banco de dados com o nome esperado pelo sistema:

```sql
CREATE DATABASE lumind_db;
```

> ⚠️ **Verifique** o nome exato do banco no arquivo `config/connection.php` antes de criá-lo.

3. Com o banco selecionado, importe o arquivo de dump SQL localizado na raiz do projeto:

```
phpMyAdmin → Selecione "lumind_db" → Aba "Importar" → Escolha o arquivo "database.sql" → Executar
```

### Passo 5 — Acessar a Aplicação

Com o servidor rodando e o banco configurado, acesse a aplicação no navegador:

```
http://localhost/projeto-lumind/login/index.html
```

🎉 O sistema estará pronto para uso.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para colaborar:

1. Faça um **fork** do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Faça o commit das suas alterações: `git commit -m 'feat: adiciona minha feature'`
4. Faça o push para a branch: `git push origin feature/minha-feature`
5. Abra um **Pull Request**

---

<div align="center">

Desenvolvido com foco em **acessibilidade** e **engenharia de software inclusiva**. <br/>
**Engenharia de Software — PUCPR** 💙

</div>
