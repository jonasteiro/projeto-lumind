# Sistema de Login - Guia de Configuração

## 1. Banco de Dados

### Se está criando o banco do zero:
Execute o arquivo `lumind_db.sql` completamente. Ele já contém o campo `nivel` na tabela cliente.

### Se o banco já existe:
Execute este comando SQL para adicionar o campo `nivel`:

```sql
ALTER TABLE cliente ADD COLUMN nivel ENUM('adm', 'responsavel', 'profissional', 'pessoa_tea') DEFAULT 'pessoa_tea';
```

Depois atualize os usuários existentes conforme necessário:

```sql
-- João é administrador
UPDATE cliente SET nivel = 'adm' WHERE usuario = 'joao_oficial';

-- Gabriela é profissional
UPDATE cliente SET nivel = 'profissional' WHERE usuario = 'gabi_tea';

-- Yasmin é pessoa com TEA
UPDATE cliente SET nivel = 'pessoa_tea' WHERE usuario = 'yasmin_luz';

-- Heitor é responsável
UPDATE cliente SET nivel = 'responsavel' WHERE usuario = 'heitor_dev';
```

## 2. Estrutura de Permissões

- **adm**: Acesso ao dashboard-administrador.php (todas as funcionalidades)
- **profissional**: Acesso ao dashboard-profissional.php (atividades, eventos, relatórios)
- **responsavel**: Acesso ao dashboard-profissional.php (mesmo acesso que profissional)
- **pessoa_tea**: Acesso ao home/index.html

## 3. Fluxo de Login

1. Usuário preenche o formulário de login
2. JavaScript envia os dados para `cliente_login.php`
3. PHP valida, sanitiza e verifica o banco de dados
4. Se bem-sucedido, a sessão é iniciada com os dados do usuário
5. JavaScript redireciona para a página correta baseado no nível

## 4. Proteção de Páginas

As páginas de dashboard (`.php`) têm validação de sessão:

```php
include_once('php/valida_sessao.php');
validar_sessao(['adm']); // ou ['profissional', 'responsavel']
```

Se o usuário não estiver autenticado ou não tiver permissão, é redirecionado para login.

## 5. Medidas de Segurança Implementadas

- ✅ Validação de campos vazios
- ✅ Sanitização com `htmlspecialchars()`
- ✅ Prepared statements contra SQL Injection
- ✅ Validação de usuário ativo no banco
- ✅ Controle de sessão por nível
- ✅ Logout seguro com destruição de sessão

## 6. Arquivos Modificados/Criados

- `lumind_db.sql` - Atualizado com campo `nivel`
- `php/cliente_login.php` - Validação e login seguro
- `php/cliente_logoff.php` - Logout melhorado
- `php/valida_sessao.php` - Funções de validação de sessão
- `home/dashboard-administrador.php` - Dashboard com validação
- `home/dashboard-profissional.php` - Dashboard com validação
- `js/cliente_login.js` - Redirecionamento por nível atualizado

## 7. Testando

Credenciais de teste:
- Admin: `joao_oficial` / `123456` → vai para dashboard-administrador.php
- Profissional: `gabi_tea` / `123456` → vai para dashboard-profissional.php
- Responsável: `heitor_dev` / `123456` → vai para dashboard-profissional.php
- Pessoa TEA: `yasmin_luz` / `123456` → vai para home/index.html

**Nota**: As senhas estão em texto puro. Para produção, use `password_hash()` do PHP!
