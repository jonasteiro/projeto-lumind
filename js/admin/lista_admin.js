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
                <td colspan="7" class="text-center py-4 text-muted">
                    Nenhum administrador cadastrado.
                </td>
            </tr>`;
        return;
    }

    let html = '';

    dados.forEach(adm => {
        // Status Existente
        const isAtivo = (adm.status_adm == 1 || adm.status_adm === "1" || adm.status_adm === true);
        const statusClass = isAtivo ? "bg-success" : "bg-danger";
        const statusTexto = isAtivo ? "Ativo" : "Inativo";

        // 1. FLOAT (Salário formatado com R$)
        const valorFloat = parseFloat(adm.salario_base || 0);
        const salarioFormatado = `R$ ${valorFloat.toFixed(2).replace('.', ',')}`;

        // 2. DATE (Data de Contratação)
        const dataContratacaoFormatada = adm.data_contratacao 
            ? new Date(adm.data_contratacao + 'T00:00:00').toLocaleDateString('pt-BR') 
            : '--';

        // 3. INT (Nível de Acesso)
        const nivelBadge = adm.nivel_acesso 
            ? `<span class="badge bg-secondary">Nv. ${adm.nivel_acesso}</span>` 
            : '--';

        // 4. VARCHAR (Departamento)
        const depto = adm.departamento || '--';

        // Montando as 7 colunas HTML
        html += `
            <tr>
                <td class="ps-3 fw-medium text-dark">
                    ${adm.nome} <br>
                    <small class="text-muted">${adm.email}</small>
                </td>
                <td class="text-muted">
                    <span class="fw-semibold text-dark">Admin</span><br>
                    <small>${depto}</small>
                </td>
                <td class="text-center">${nivelBadge}</td>
                <td class="text-muted">${dataContratacaoFormatada}</td>
                <td class="text-success fw-semibold">${salarioFormatado}</td> 
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

async function excluir(id) {
    if (confirm("Deseja realmente remover este administrador?")) {
        try {
            const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
            const resposta = await retorno.json();
            
            alert(resposta.mensagem); 
            
            if (resposta.status === "ok") {
                window.location.reload();
            }
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Erro de comunicação ao tentar excluir.");
        }
    }
}