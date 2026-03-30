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
        tr.setAttribute('data-id', usuario.id); // <-- Adiciona o ID no <tr>
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${usuario.usuario}</td>
            <td>${usuario.email}</td>
            <td><span class="badge ${badge.classe}">${badge.label}</span></td>
            <td>${status}</td>
            <td>
                <button class="btn-acao btn-editar">Editar</button>
                <button class="btn-acao btn-deletar">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Adiciona eventos aos botões após preencher a tabela
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.onclick = function() {
            editarUsuarioInline(this.closest('tr'));
        };
    });
    document.querySelectorAll('.btn-deletar').forEach(btn => {
        btn.onclick = function() {
            deletarUsuario(this.closest('tr').getAttribute('data-id'));
        };
    });
}

// Edição inline do usuário
function editarUsuarioInline(tr) {
    if (tr.classList.contains('editando')) return;

    tr.classList.add('editando');
    const tds = tr.querySelectorAll('td');
    const nome = tds[0].innerText;
    const usuario = tds[1].innerText;
    const email = tds[2].innerText;
    const perfil = tds[3].innerText.trim();
    const status = tds[4].innerText.trim();

    // Campos editáveis
    tds[0].innerHTML = `<input type="text" value="${nome}" style="width:90%;">`;
    tds[1].innerHTML = `<input type="text" value="${usuario}" style="width:90%;">`;
    tds[2].innerHTML = `<input type="email" value="${email}" style="width:90%;">`;
    tds[3].innerHTML = `
        <select>
            <option value="pessoa_tea" ${perfil === 'Pessoa TEA' ? 'selected' : ''}>Pessoa TEA</option>
            <option value="responsavel" ${perfil === 'Responsável' ? 'selected' : ''}>Responsável</option>
            <option value="profissional" ${perfil === 'Profissional' ? 'selected' : ''}>Profissional</option>
            <option value="adm" ${perfil === 'Administrador' ? 'selected' : ''}>Administrador</option>
        </select>
    `;
    tds[4].innerHTML = `
        <select>
            <option value="1" ${status === 'Ativo' ? 'selected' : ''}>Ativo</option>
            <option value="0" ${status === 'Inativo' ? 'selected' : ''}>Inativo</option>
        </select>
    `;
    tds[5].innerHTML = `
        <button class="btn-acao btn-salvar">Salvar</button>
        <button class="btn-acao btn-cancelar">Cancelar</button>
    `;

    // Salvar
    tds[5].querySelector('.btn-salvar').onclick = async function() {
        const novoNome = tds[0].querySelector('input').value;
        const novoUsuario = tds[1].querySelector('input').value;
        const novoEmail = tds[2].querySelector('input').value;
        const novoNivel = tds[3].querySelector('select').value;
        const novoAtivo = tds[4].querySelector('select').value;
        const id = tr.getAttribute('data-id'); // <-- Pega o ID do <tr>

        // Envia para o backend (AJAX)
        try {
            const fd = new FormData();
            fd.append('id', id);
            fd.append('nome', novoNome);
            fd.append('usuario', novoUsuario);
            fd.append('email', novoEmail);
            fd.append('nivel', novoNivel);
            fd.append('ativo', novoAtivo);

            const resposta = await fetch('../php/cliente_alterar.php', {
                method: 'POST',
                body: fd
            });
            const dados = await resposta.json();

            if (dados.status === 'ok' || dados.status === 'sucesso') {
                alert('Usuário atualizado com sucesso!');
                buscarUsuarios();
            } else {
                alert('Erro ao atualizar: ' + (dados.mensagem || 'Tente novamente.'));
            }
        } catch (erro) {
            alert('Erro ao atualizar usuário.');
            console.error(erro);
        }
    };

    // Cancelar
    tds[5].querySelector('.btn-cancelar').onclick = function() {
        buscarUsuarios();
    };
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
