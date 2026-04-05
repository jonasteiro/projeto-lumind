document.addEventListener("DOMContentLoaded", () => {
    buscarAdmins();

    // Redireciona para a tela de cadastro que já criamos
    document.getElementById("btnNovoAdmin").addEventListener("click", () => {
        window.location.href = 'cadastro_admin.html';
    });
});

async function buscarAdmins() {
    const listaDiv = document.getElementById("lista");
    
    try {
        const retorno = await fetch("../php/admin/administrador_get.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            preencherTabela(resposta.data);
        } else {
            listaDiv.innerHTML = `<p class="text-center text-muted">${resposta.mensagem}</p>`;
        }
    } catch (erro) {
        listaDiv.innerHTML = `<p class="text-center text-danger">Erro de comunicação com o servidor.</p>`;
    }
}

function preencherTabela(dados) {
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3">Nome</th>
                    <th class="py-3">CPF</th>
                    <th class="py-3">Email</th>
                    <th class="py-3">Status</th>
                    <th class="py-3 text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(adm => {
        // Usa as classes que você já tem no CSS original para status
        const statusClass = adm.status_adm ? "status-active" : "status-inactive";
        const statusTexto = adm.status_adm ? "Ativo" : "Inativo";

        html += `
            <tr>
                <td class="fw-bold">${adm.nome}</td>
                <td>${adm.cpf}</td>
                <td class="text-muted">${adm.email}</td>
                <td><span class="badge ${statusClass}">${statusTexto}</span></td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='cadastro_admin.html?id=${adm.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${adm.id_usuario})" class="btn btn-sm btn-outline-danger border-0">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

async function excluir(id) {
    if (confirm("Deseja realmente remover este administrador?")) {
        const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
        const resposta = await retorno.json();
        alert(resposta.mensagem);
        if (resposta.status === "ok") window.location.reload();
    }
}