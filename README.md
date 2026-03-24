# Lumind - Tecnologia Inclusiva e Gestão para o Espectro Autista (TEA)

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

## 🎯 Propósito e o Fator Humano
O **Lumind** não é apenas um sistema de gestão de dados; é uma plataforma desenvolvida com foco empático para apoiar pessoas com Transtorno do Espectro Autista (TEA) e suas redes de apoio. Nascido como uma solução para a disciplina de *Experiência Criativa: Projetando Soluções Computacionais*, o sistema visa organizar informações críticas de forma acessível, segura e, acima de tudo, confortável para o usuário.

Pessoas no espectro autista frequentemente enfrentam desafios com sobrecarga sensorial. Por isso, a arquitetura visual do Lumind foi projetada sob rigorosos critérios de acessibilidade (a11y):
* **Baixo Contraste Sensorial:** Uso de paletas neutras (tons sálvia e fundos brancos) para evitar fadiga visual.
* **Interface Limpa (Clean UI):** Remoção de animações desnecessárias e elementos poluentes que causam distração ou desconforto.
* **Navegação Previsível:** Estruturas lógicas claras e feedback imediato para reduzir a ansiedade na interação com o software.

## 🚀 Funcionalidades Principais
A aplicação oferece uma interface de gestão completa (CRUD) operando de forma assíncrona para garantir fluidez:
- **Autenticação Segura:** Login protegido com validação de sessão e feedback visual claro de erros.
- **Painel de Controle (Dashboard):** Visualização em formato *Data Grid* limpo para leitura de registros e perfis ativos.
- **Gestão de Usuários/Pacientes:** Formulários otimizados com *Floating Labels* e *Toggle Switches* amigáveis para cadastro e atualização de prontuários.
- **Processamento Assíncrono:** Uso de requisições AJAX (Fetch API) para que a interface não recarregue abruptamente, mantendo a estabilidade visual para o usuário.

## 🛠️ Stack Tecnológica
- **Front-end:** HTML5 Semântico, CSS3 (Modular e Customizado), JavaScript Vanilla (ES6+).
- **Framework de UI:** Bootstrap 5.3 (Estrutura responsiva) e Bootstrap Icons.
- **Back-end:** PHP 8+ (Regras de negócio e comunicação com o banco).
- **Banco de Dados:** MySQL (Persistência e integridade relacional).

## ⚙️ Como Executar o Projeto Localmente
Para avaliadores e desenvolvedores que desejam testar a aplicação localmente, siga os passos abaixo:

### 1. Pré-requisitos
Certifique-se de ter um ambiente de servidor local instalado na sua máquina, como o [XAMPP](https://www.apachefriends.org/), WAMP ou Laragon, que inclua **Apache** e **MySQL**.

### 2. Configuração do Repositório e Servidor
1. Clone este repositório:
   ```bash
   git clone (https://github.com/jonasteiro/projeto-lumind.git

2. Mova a pasta "projeto-lumind" para o diretório público do seu servidor (ex: C:\xampp\htdocs).

3. Inicie os serviços do Apache e MySQL no painel de controle do seu servidor local.

4. Configuração do Banco de Dados
Abra o navegador e acesse o gerenciador do banco (geralmente http://localhost/phpmyadmin).

5. Crie um novo banco de dados (verifique o nome exato esperado no arquivo de conexão PHP, ex: lumind_db).

6. Localize o arquivo de dump SQL na raiz deste projeto (ex: database.sql) e importe-o para o banco recém-criado. Isso irá gerar as tabelas necessárias para o sistema funcionar.

7. Acesso ao Sistema
Com o banco configurado e o servidor rodando, abra seu navegador e acesse a porta de entrada da aplicação:

http://localhost/projeto-lumind/login/index.html

Desenvolvido com foco em acessibilidade e engenharia de software inclusiva.
Engenharia de Software - PUCPR.
