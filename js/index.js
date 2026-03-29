// Funções de Navegação
function abrirFormulario(tipo) {
    // Redirecionar para página de cadastro apropriada baseado no tipo
    switch(tipo) {
        case 'adm':
            window.location.href = 'cadastro_adm.html';
            break;
        case 'profissional':
            window.location.href = 'cadastro_profissional.html';
            break;
        case 'responsavel':
            window.location.href = 'cadastro_responsavel.html';
            break;
        case 'pessoa_tea':
            window.location.href = 'cadastro_tea.html';
            break;
        default:
            alert('Tipo de perfil inválido');
    }
}

function voltarDashboard() {
    window.location.href = 'dashboard-administrador.html';
}

function logout() {
    fetch('../php/cliente_logoff.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' || data.status === 'sucesso') {
                window.location.href = '../login/index.html';
            }
        })
        .catch(error => {
            console.error('Erro ao fazer logout:', error);
            window.location.href = '../login/index.html';
        });
}

// Mapear o nível para o badge apropriado
function obterBadge(nivel) {
    const badges = {
        'pessoa_tea': 'badge-tea',
        'responsavel': 'badge-responsavel',
        'profissional': 'badge-profissional',
        'adm': 'badge-adm'
    };
    
    const labels = {
        'pessoa_tea': 'Pessoa TEA',
        'responsavel': 'Responsável',
        'profissional': 'Profissional',
        'adm': 'Administrador'
    };

    return {
        classe: badges[nivel] || 'badge-tea',
        label: labels[nivel] || nivel
    };
}

// Mapear status ativo/inativo
function obterStatus(ativo) {
    if (ativo == 1 || ativo === '1') {
        return '<span class="status-ativo">Ativo</span>';
    } else {
        return '<span class="status-inativo">Inativo</span>';
    }
}

// Buscar usuários do banco de dados
async function buscarUsuarios() {
    try {
        const resposta = await fetch('../php/cliente_get.php');
        const dados = await resposta.json();

        if (dados.status === 'ok' && dados.data.length > 0) {
            preencherTabela(dados.data);
        } else {
            console.log('Nenhum usuário encontrado');
        }
    } catch (erro) {
        console.error('Erro ao buscar usuários:', erro);
    }
}

// Preencher tabela com dados dos usuários
function preencherTabela(usuarios) {
    const tbody = document.querySelector('.usuarios-table tbody');
    
    if (!tbody) {
        console.error('Elemento tbody não encontrado');
        return;
    }

    // Limpar linhas existentes
    tbody.innerHTML = '';

    // Preencher com dados reais
    usuarios.forEach(usuario => {
        const badge = obterBadge(usuario.nivel);
        const status = obterStatus(usuario.ativo);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.usuario}</td>
            <td>${usuario.email}</td>
            <td><span class="badge ${badge.classe}">${badge.label}</span></td>
            <td>${status}</td>
            <td>
                <button class="btn-acao btn-editar" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="btn-acao btn-deletar" onclick="deletarUsuario(${usuario.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Editar usuário
function editarUsuario(id) {
    alert('Função de edição em desenvolvimento. ID: ' + id);
    // window.location.href = 'cliente_alterar.html?id=' + id;
}

// Deletar usuário
async function deletarUsuario(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        try {
            const resposta = await fetch('../php/cliente_excluir.php?id=' + id);
            const dados = await resposta.json();

            if (dados.status === 'ok' || dados.status === 'sucesso') {
                alert('Usuário excluído com sucesso');
                buscarUsuarios(); // Recarregar tabela
            } else {
                alert('Erro: ' + (dados.mensagem || 'Não foi possível excluir o usuário'));
            }
        } catch (erro) {
            console.error('Erro ao deletar usuário:', erro);
            alert('Erro ao excluir usuário');
        }
    }
}

// Carregar usuários quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    buscarUsuarios();
});
