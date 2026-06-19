document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Busca os dados de quem está logado para preencher a barra lateral (se existir)
    carregarSessaoLogada();

    // 2. Busca a lista de administradores para a tabela
    buscarAdmins();

    // Redireciona para a tela de cadastro
    const btnNovoAdmin = document.getElementById("btnNovoAdmin");
    if (btnNovoAdmin) {
        btnNovoAdmin.addEventListener("click", () => {
            window.location.href = 'cadastro_admin.html';
        });
    }

    // Lógica do botão de Logoff
    const btnLogoff = document.getElementById("logoff");
    if (btnLogoff) {
        btnLogoff.addEventListener("click", async (event) => {
            event.preventDefault();
            
            try {
                const retorno = await fetch("../php/cliente_logoff.php");
                const resposta = await retorno.json();
                
                if (resposta.status === "ok") {
                    window.location.href = '/projeto-lumind/login/index.html'; 
                } else {
                    console.error("Falha ao destruir a sessão no servidor.");
                }
            } catch (error) {
                console.error("Erro na requisição de logoff:", error);
            }
        });
    }
});

// =======================================================
// FUNÇÃO NOVA: Preenche o nome do usuário logado no Menu
// =======================================================
async function carregarSessaoLogada() {
    const elNome = document.getElementById("sidebarNome");
    const elAvatar = document.getElementById("sidebarAvatar");

    // SE OS ELEMENTOS NÃO EXISTIREM NA TELA (Ex: Tela de lista limpa), ELE ABORTA SILENCIOSAMENTE!
    if (!elNome || !elAvatar) return;

    try {
        const retorno = await fetch("../php/get_sessao.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok" && resposta.nome) {
            elNome.textContent = resposta.nome;
            
            const partesNome = resposta.nome.trim().split(" ");
            let iniciais = partesNome[0].charAt(0).toUpperCase(); 
            
            if (partesNome.length > 1) {
                iniciais += partesNome[partesNome.length - 1].charAt(0).toUpperCase();
            }
            
            elAvatar.textContent = iniciais;
        } else {
            elNome.textContent = "Administrador";
        }
    } catch (erro) {
        console.error("Erro ao buscar a sessão:", erro);
        elNome.textContent = "Administrador";
    }
}

// =======================================================
// RENDERIZAÇÃO DA TABELA
// =======================================================
async function buscarAdmins() {
    const tbody = document.getElementById("tabela-admins-body");
    
    // Trava de segurança: Se a tabela não existir, não faz fetch à toa
    if (!tbody) return; 

    try {
        const retorno = await fetch("../php/admin/administrador_get.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            preencherTabela(resposta.data, tbody);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        ${resposta.mensagem}
                    </td>
                </tr>`;
        }
    } catch (erro) {
        console.error("Erro no fetch:", erro);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i> Erro de comunicação com o servidor.
                </td>
            </tr>`;
    }
}

function preencherTabela(dados, tbody) {
    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    Nenhum administrador cadastrado.
                </td>
            </tr>`;
        return;
    }

    let html = '';

    dados.forEach(adm => {
        const isAtivo = (adm.status_adm == 1 || adm.status_adm === "1" || adm.status_adm === true);
        const statusClass = isAtivo ? "bg-success" : "bg-danger";
        const statusTexto = isAtivo ? "Ativo" : "Inativo";

        html += `
            <tr>
                <td class="ps-3 fw-medium text-dark">${adm.nome}</td>
                <td class="text-muted">${adm.email}</td>
                <td class="text-muted">${adm.cpf || '---'}</td>
                <td class="text-center">
                    <span class="badge ${statusClass} rounded-pill px-3 py-2">${statusTexto}</span>
                </td>
                <td class="text-end pe-3">
                    <div class="btn-group">
                        <a href="alterar_admin.html?id=${adm.id_usuario}" class="btn btn-sm btn-outline-primary rounded-pill me-1" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${adm.id_usuario})" class="btn btn-sm btn-outline-danger rounded-pill" title="Excluir">
                            <i class="bi bi-trash3"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}

// =======================================================
// EXCLUSÃO COM SWEETALERT2
// =======================================================
async function excluir(id) {
    // 1. Exibe a confirmação visual personalizada
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: "Deseja realmente remover este administrador? Essa ação não pode ser desfeita.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash3"></i> Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    // 2. Se o usuário confirmar, faz a requisição PHP
    if (confirmacao.isConfirmed) {
        try {
            const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
            const resposta = await retorno.json();
            
            if (resposta.status === "ok") {
                // Mensagem de sucesso aguardando o usuário clicar em "OK"
                await Swal.fire({
                    title: 'Excluído!',
                    text: resposta.mensagem,
                    icon: 'success',
                    confirmButtonColor: '#0d6efd'
                });
                
                // Recarrega a página após a confirmação
                window.location.reload();
            } else {
                // Mensagem de erro do backend
                Swal.fire({
                    title: 'Atenção!',
                    text: resposta.mensagem,
                    icon: 'error',
                    confirmButtonColor: '#0d6efd'
                });
            }
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            // Mensagem de erro de conexão/fetch
            Swal.fire({
                title: 'Erro!',
                text: 'Erro de comunicação ao tentar excluir.',
                icon: 'error',
                confirmButtonColor: '#0d6efd'
            });
        }
    }
}