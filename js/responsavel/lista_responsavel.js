document.addEventListener("DOMContentLoaded", () => {
    buscarResponsaveis();

    const btnNovo = document.getElementById("btnNovoResponsavel");
    if (btnNovo) {
        btnNovo.addEventListener("click", () => {
            window.location.href = 'cadastro_responsavel.html';
        });
    }
});

async function buscarResponsaveis() {
    const listaDiv = document.getElementById("lista");
    
    try {
        const retorno = await fetch("../php/responsavel/responsavel_get.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            preencherTabela(resposta.data);
        } else {
            listaDiv.innerHTML = `<div class="text-center py-5">
                                    <i class="bi bi-inbox text-muted fs-1 mb-3 d-block"></i>
                                    <p class='text-muted fs-5'>${resposta.mensagem}</p>
                                  </div>`;
        }
    } catch (erro) {
        listaDiv.innerHTML = `<p class="text-center text-danger py-4">Erro ao conectar com o servidor.</p>`;
    }
}

function preencherTabela(dados) {
    if (!dados || dados.length === 0) {
        document.getElementById("lista").innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                <p class='text-muted fs-5'>Nenhum responsável cadastrado.</p>
            </div>`;
        return;
    }

    let html = `
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr>
                    <th class="text-secondary fw-semibold py-3 ps-3">Responsável</th>
                    <th class="text-secondary fw-semibold py-3">CPF</th>
                    <th class="text-secondary fw-semibold py-3">Email</th>
                    <th class="text-secondary fw-semibold py-3">Telefone</th>
                    <th class="text-secondary fw-semibold py-3 text-end pe-3">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(r => {
        html += `
            <tr>
                <td class="fw-bold text-dark ps-3">${r.nome}</td>
                <td class="text-muted">${r.cpf}</td>
                <td class="text-muted">${r.email}</td>
                <td class="text-muted">${r.telefone || 'Não informado'}</td>
                <td class="text-end pe-3">
                    <div class="btn-group gap-2">
                        <a href='alterar_responsavel.html?id=${r.id_usuario}' class="btn btn-sm btn-outline-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${r.id_usuario})" class="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Excluir Responsável">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

// =======================================================
// EXCLUSÃO COM SWEETALERT2
// =======================================================
async function excluir(id) {
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: "Deseja realmente excluir este responsável? O acesso dele ao sistema será revogado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash3"></i> Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        
        Swal.fire({
            title: 'Excluindo...',
            text: 'Removendo o responsável do sistema.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
            const resposta = await retorno.json();
            
            if (resposta.status === "ok") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Excluído!',
                    text: resposta.mensagem,
                    confirmButtonColor: '#0d6efd'
                });
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Atenção!',
                    text: resposta.mensagem,
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (erro) {
            console.error("Erro na exclusão:", erro);
            Swal.fire({
                icon: 'error',
                title: 'Erro de Comunicação',
                text: 'Não foi possível se conectar com o servidor.',
                confirmButtonColor: '#dc3545'
            });
        }
    }
}