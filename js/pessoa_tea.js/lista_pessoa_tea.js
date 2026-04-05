document.addEventListener("DOMContentLoaded", () => {
    buscarPacientes();
    
    // Botão Novo
    document.getElementById("novoPaciente").addEventListener("click", () => {
        window.location.href = 'cadastro_pessoa_tea.html';
    });
});

async function buscarPacientes() {
    const retorno = await fetch("../php/pessoa_tea/pessoa_tea_get.php");
    const resposta = await retorno.json();
    if (resposta.status == "ok") {
        preencherTabela(resposta.data);
    } else {
        document.getElementById("lista").innerHTML = `<p class='text-center text-muted'>${resposta.mensagem}</p>`;
    }
}

function preencherTabela(tabela) {
    var html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3">Nome</th>
                    <th class="py-3">Nível TEA</th>
                    <th class="py-3">Email</th>
                    <th class="py-3">CPF</th>
                    <th class="py-3 text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    for (var i = 0; i < tabela.length; i++) {
        html += `
            <tr>
                <td class="fw-medium">${tabela[i].nome}</td>
                <td><span class="badge bg-info-subtle text-info-emphasis rounded-pill px-3">${tabela[i].nivel_tea}</span></td>
                <td class="text-muted">${tabela[i].email}</td>
                <td>${tabela[i].cpf}</td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='cadastro_pessoa_tea.html?id=${tabela[i].id_usuario}' class="btn btn-sm btn-outline-primary border-0">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick='excluir(${tabela[i].id_usuario})' class="btn btn-sm btn-outline-danger border-0">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }

    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

async function excluir(id) {
    if (confirm("Deseja realmente excluir este registro?")) {
        const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
        const resposta = await retorno.json();
        alert(resposta.mensagem);
        if (resposta.status == "ok") window.location.reload();
    }
}