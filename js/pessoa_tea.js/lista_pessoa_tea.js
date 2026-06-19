// js/pessoa_tea.js/lista_pessoa_tea.js
document.addEventListener("DOMContentLoaded", () => {
    buscarPacientes();
    
    // Botão Novo
    const btnNovo = document.getElementById("novoPaciente");
    if(btnNovo) {
        btnNovo.addEventListener("click", () => {
            window.location.href = 'cadastro_pessoa_tea.html';
        });
    }

    // Botão Logoff já é tratado pelo valida_sessao.js, 
    // mas se precisar de fallback para o logoff nesta página específica:
    const btnLogoff = document.getElementById("logoff");
    if(btnLogoff && !btnLogoff.onclick) {
        btnLogoff.addEventListener("click", async (e) => {
            e.preventDefault();
            await fetch('../php/cliente_logoff.php');
            window.location.href = '../login/index.html';
        });
    }
});

async function buscarPacientes() {
    const retorno = await fetch("../php/pessoa_tea/pessoa_tea_get.php");
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox text-muted fs-1 mb-3 d-block"></i>
                <p class='text-muted fs-5'>${resposta.mensagem}</p>
            </div>`;
    }
}

function preencherTabela(tabela) {
    if(!tabela || tabela.length === 0) {
        document.getElementById("lista").innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                <p class='text-muted fs-5'>Nenhum paciente (TEA) cadastrado.</p>
            </div>`;
        return;
    }

    var html = `
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th class="text-secondary fw-semibold py-3 ps-3">Nome</th>
                    <th class="text-secondary fw-semibold py-3">Nível TEA</th>
                    <th class="text-secondary fw-semibold py-3">Email</th>
                    <th class="text-secondary fw-semibold py-3">CPF</th>
                    <th class="text-secondary fw-semibold py-3 text-end pe-3">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    for (var i = 0; i < tabela.length; i++) {
        html += `
            <tr>
                <td class="fw-bold text-dark ps-3">${tabela[i].nome}</td>
                <td><span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-2">${tabela[i].nivel_tea}</span></td>
                <td class="text-muted">${tabela[i].email}</td>
                <td class="text-muted">${tabela[i].cpf}</td>
                <td class="text-end pe-3">
                    <div class="btn-group gap-2">
                        <a href='alterar_pessoa_tea.html?id=${tabela[i].id_usuario}' class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Editar Paciente">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick='excluir(${tabela[i].id_usuario})' class="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Excluir Paciente">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

// =======================================================
// EXCLUSÃO COM SWEETALERT2
// =======================================================
async function excluir(id) {
    // 1. Modal de Confirmação customizado
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: "Deseja realmente excluir este paciente? Todas as atividades e relatórios vinculados a ele serão perdidos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash3"></i> Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    // 2. Se o usuário confirmou, fazemos a exclusão
    if (confirmacao.isConfirmed) {
        
        // Exibe loading enquanto deleta
        Swal.fire({
            title: 'Excluindo...',
            text: 'Removendo o paciente do sistema.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
            const resposta = await retorno.json();
            
            if (resposta.status == "ok") {
                // Alerta de sucesso e recarrega a página
                await Swal.fire({
                    icon: 'success',
                    title: 'Excluído!',
                    text: resposta.mensagem,
                    confirmButtonColor: '#0d6efd'
                });
                window.location.reload();
            } else {
                // Alerta de erro vindo do PHP
                Swal.fire({
                    icon: 'error',
                    title: 'Atenção!',
                    text: resposta.mensagem,
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (erro) {
            console.error("Erro na requisição de exclusão:", erro);
            // Alerta de falha de conexão
            Swal.fire({
                icon: 'error',
                title: 'Erro de Comunicação',
                text: 'Não foi possível se conectar com o servidor. Tente novamente mais tarde.',
                confirmButtonColor: '#dc3545'
            });
        }
    }
}