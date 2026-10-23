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

O Lumind não é apenas um CRUD; é uma decisão arquitetural onde cada componente de UI foi escolhido com o objetivo de reduzir a carga cognitiva e a ansiedade na interação com software.

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

- 🔐 **Autenticação Segura** — Login com validação de sessão PHP, recuperação de senha e feedback visual de erros
- 📊 **Painel de Controle por Perfil** — Dashboards distintos para Administrador, Profissional, Responsável e Pessoa TEA
- 👤 **Gestão Completa de Usuários (CRUD)** — Cadastro e atualização de administradores, profissionais, responsáveis e pacientes TEA
- 📋 **Módulo de Atividades** — Publicação, edição, visualização e acompanhamento de atividades terapêuticas
- 📄 **Análise de Documentação** — Fluxo de aprovação de documentos de profissionais pelo administrador
- 📈 **Relatórios** — Geração e listagem de relatórios por profissional e responsável
- ⚡ **Processamento Assíncrono** — Todas as operações via Fetch API (AJAX), sem recarregamentos abruptos de página

---

## 🛠️ Tecnologias Utilizadas

### Front-end
| Tecnologia | Versão | Função |
|---|---|---|
| HTML5 Semântico | — | Estrutura e acessibilidade das páginas |
| CSS3 Modular | — | Estilização customizada por módulo/perfil |
| JavaScript Vanilla | ES6+ | Lógica de UI, Fetch API e validação de sessão |
| Bootstrap | 5.3 | Grid responsivo e componentes de UI |
| Bootstrap Icons | 1.x | Iconografia acessível da interface |

### Back-end & Banco de Dados
| Tecnologia | Versão | Função |
|---|---|---|
| PHP | 8+ | Regras de negócio, sessões e endpoints internos |
| MySQL | 8.x | Persistência relacional de prontuários e relatórios |
| Apache | 2.4+ | Servidor HTTP local (via XAMPP / Laragon) |

---

## 📁 Arquitetura do Projeto

A organização segue uma separação por **camada** (css, js, php) e, dentro de cada camada, por **perfil de usuário ou módulo funcional**.

```
projeto-lumind/
│
├── 📄 lumind_db.sql               # Dump completo do banco de dados
├── 📄 README.md
│
├── 📂 login/
│   └── index.html                 # ✅ Ponto de entrada da aplicação
│
├── 📂 home/                       # Páginas HTML por módulo
│   ├── atividades/
│   │   ├── editar_atividade.html
│   │   ├── publicar_atividade.html
│   │   ├── tela_atividade.html
│   │   └── view_atividade_profissional.html
│   ├── profissional/
│   │   ├── alterar_profissional.html
│   │   ├── analisar_documentacao.html
│   │   └── listar-profissionais.html
│   ├── index.html                 # Dashboard principal
│   ├── tela_administrador.html
│   ├── tela_pessoa_tea.html
│   ├── tela_profissional.html
│   ├── tela_responsavel.html
│   ├── cadastro_admin.html
│   ├── cadastro_pessoa_tea.html
│   ├── cadastro_profissional.html
│   ├── cadastro_responsavel.html
│   ├── aprovacoes_admin.html
│   ├── atividades_painel.html
│   ├── lista_administrador.html
│   ├── lista_pessoa_tea.html
│   ├── lista_responsavel.html
│   ├── lista_relatorios_profissional.html
│   ├── lista_relatorios_responsavel.html
│   ├── relatorio_responsavel.html
│   ├── status_profissional.html
│   └── feedback.html
│   └── ...
│
├── 📂 css/                        # Estilos modulares por perfil
│   ├── administrador/
│   │   ├── alterar_admin.css
│   │   ├── cadastro_admin.css
│   │   ├── decisao-admin.css
│   │   └── lista_administrador.css
│   ├── atividades/
│   │   ├── painel_atividades.css
│   │   ├── publicar_atividade.css
│   │   └── tela_atividade.css
│   ├── pessoa_tea/
│   │   ├── alterar-cadastro.css
│   │   ├── cadastro_pessoa_tea.css
│   │   └── lista_pessoa_tea.css
│   ├── profissional/
│   │   ├── alterar_profissional.css
│   │   ├── analisar_documentacao.css
│   │   ├── exibir-detalhes.css
│   │   ├── listar-profissionais.css
│   │   └── profissional.css
│   ├── responsavel/
│   │   └── listar-responsavel.css
│   ├── login.css
│   ├── tela_administrador.css
│   ├── tela_paciente.css
│   ├── tela_profissional.css
│   ├── tela_responsavel.css
│   ├── tema_paciente.css
│   └── logo-lumind.png
│
├── 📂 js/                         # Scripts por perfil de usuário
│   ├── admin/
│   │   ├── admin_alterar.js
│   │   ├── admin_aprovacoes.js
│   │   ├── admin_novo.js
│   │   ├── lista_admin.js
│   │   ├── listar-profissional.js
│   │   └── tela_administrador.js
│   ├── atividade/
│   │   ├── atividades_paciente.js
│   │   ├── atividades_responsavel.js
│   │   ├── editar_atividade.js
│   │   ├── painel_atividades.js
│   │   ├── publicar_atividade.js
│   │   ├── tela_atividade.js
│   │   └── view_atividade_profissional.js
│   ├── pessoa_tea.js/
│   │   ├── lista_pessoa_tea.js
│   │   ├── pessoa_tea_alterar.js
│   │   └── pessoa_tea_novo.js
│   ├── profissional/
│   │   ├── alterar_profissional.js
│   │   ├── analisar_documentacao.js
│   │   ├── lista_relatorios.js
│   │   ├── listar-profissionais.js
│   │   ├── profissional_novo.js
│   │   ├── profissional_status.js
│   │   └── tela_profissional.js
│   ├── responsavel/
│   │   ├── lista_relatorios.js
│   │   ├── lista_responsavel.js
│   │   ├── relatorio.js
│   │   ├── responsavel_alterar.js
│   │   └── responsavel_novo.js
│   ├── index.js
│   ├── recuperar_senha.js
│   ├── tema_paciente.js
│   ├── usuario_login.js
│   └── valida_sessao.js           # Middleware de sessão no front-end
│
└── 📂 php/                        # Back-end: endpoints e utilitários
    ├── admin/
    │   ├── administrador_alterar.php
    │   ├── administrador_get.php
    │   ├── listar_pendentes.php
    │   ├── status_aprovacao.php
    │   └── visualizar_documentacao.php
    ├── atividades/
    │   ├── criar_atividade.php
    │   ├── editar_atividade.php
    │   ├── deletar_atividade.php
    │   ├── atualizar_atividade.php
    │   ├── atividades_get.php
    │   ├── atividade_detalhes.php
    │   ├── atividade_submissoes.php
    │   ├── buscar_pacientes.php
    │   ├── concluir_atividade.php
    │   └── salvar_feedback.php
    ├── login/
    │   ├── redefinir_senha.php
    │   └── solicitar_recuperacao.php
    ├── pessoa_tea/
    │   ├── pessoa_tea_alterar.php
    │   └── pessoa_tea_get.php
    ├── profissional/
    │   ├── alterar_profissional.php
    │   ├── atualizar_status_doc.php
    │   ├── buscar_documentos.php
    │   ├── listar-profissionais.php
    │   ├── profissional_status.php
    │   └── relatorios_listar.php
    ├── responsavel/
    │   ├── dependentes_get.php
    │   ├── relatorio_salvar.php
    │   ├── relatorios_atualizar.php
    │   ├── relatorios_listar.php
    │   ├── responsavel_alterar.php
    │   └── responsavel_get.php
    ├── conexao.php                # Configuração da conexão com o banco
    ├── valida_sessao.php          # Middleware de autenticação PHP
    ├── get_sessao.php
    ├── usuario_login.php
    ├── usuario_novo.php
    ├── usuario_excluir.php
    └── cliente_logoff.php
```

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

2. Crie um novo banco de dados:

```sql
CREATE DATABASE lumind_db;
```

3. Com o banco selecionado, importe o arquivo de dump SQL localizado na raiz do projeto:

```
phpMyAdmin → Selecione "lumind_db" → Aba "Importar" → Escolha "lumind_db.sql" → Executar
```

> ⚠️ O arquivo de dump está na raiz do repositório com o nome **`lumind_db.sql`**. Confirme as credenciais de acesso no arquivo `php/conexao.php` e ajuste se necessário.

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
