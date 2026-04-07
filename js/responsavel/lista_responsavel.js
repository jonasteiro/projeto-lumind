document.addEventListener("DOMContentLoaded", () => {
    buscarResponsaveis();

    document.getElementById("btnNovoResponsavel").addEventListener("click", () => {
        window.location.href = 'cadastro_responsavel.html';
    });
});

async function buscarResponsaveis() {
    const listaDiv = document.getElementById("lista");
    
    try {
        const retorno = await fetch("../php/responsavel/responsavel_get.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            preencherTabela(resposta.data);
        } else {
            listaDiv.innerHTML = `<p class="text-center text-muted">${resposta.mensagem}</p>`;
        }
    } catch (erro) {
        listaDiv.innerHTML = `<p class="text-center text-danger">Erro ao conectar com o servidor.</p>`;
    }
}

function preencherTabela(dados) {
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th>Responsável</th>
                    <th>CPF</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th class="text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(r => {
        html += `
            <tr>
                <td class="fw-bold">${r.nome}</td>
                <td>${r.cpf}</td>
                <td class="text-muted">${r.email}</td>
                <td>${r.telefone || 'Não informado'}</td>
                <td class="text-end">
                    <a href='alterar_responsavel.html?id=${r.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                    </a>
                    <button onclick="excluir(${r.id_usuario})" class="btn btn-sm btn-outline-danger border-0">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

async function excluir(id) {
    if (confirm("Deseja realmente excluir este responsável?")) {
        const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
        const resposta = await retorno.json();
        alert(resposta.mensagem);
        if (resposta.status === "ok") window.location.reload();
    }
}