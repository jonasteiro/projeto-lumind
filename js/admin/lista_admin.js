document.addEventListener("DOMContentLoaded", () => {
    buscarAdmins();

    // Redireciona para a tela de cadastro
    document.getElementById("btnNovoAdmin").addEventListener("click", () => {
        window.location.href = 'cadastro_admin.html';
    });

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
        const isAtivo = (adm.status_adm == 1 || adm.status_adm === "1" || adm.status_adm === true);
        
        const statusClass = isAtivo ? "bg-success" : "bg-danger";
        const statusTexto = isAtivo ? "Ativo" : "Inativo";

        html += `
            <tr>
                <td class="fw-bold">${adm.nome}</td>
                <td>${adm.cpf}</td>
                <td class="text-muted">${adm.email}</td>
                <td><span class="badge ${statusClass}">${statusTexto}</span></td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='alterar_admin.html?id=${adm.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
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

// Só entra se for Administrador
validarAcesso('Administrador');