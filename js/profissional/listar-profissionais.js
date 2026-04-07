document.addEventListener("DOMContentLoaded", () => {
    buscarProfissionais();

    document.getElementById("btnNovoProfissional").addEventListener("click", () => {
        window.location.href = 'cadastro_profissional.html';
    });
});

async function buscarProfissionais() {
    const listaDiv = document.getElementById("lista");
    
    try {
        const retorno = await fetch("../../php/profissional/listar-profissionais.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            preencherTabela(resposta.data);
        } else {
            listaDiv.innerHTML = `<p class="text-center text-muted">${resposta.mensagem}</p>`;
        }
    } catch (erro) {
        console.error(erro);
        listaDiv.innerHTML = `<p class="text-center text-danger">Erro de comunicação com o servidor.</p>`;
    }
}

function preencherTabela(dados) {
    let html = `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="py-3">Nome</th>
                    <th class="py-3">Especialidade</th>
                    <th class="py-3">CRP/CRM</th>
                    <th class="py-3">Status Doc.</th>
                    <th class="py-3 text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(prof => {
        let statusColor = "text-bg-secondary";
        let statusTexto = prof.status_aprovacao || "Sem envio";

        if (prof.status_aprovacao === "Aprovado") statusColor = "text-bg-success";
        else if (prof.status_aprovacao === "Aguardando") statusColor = "text-bg-warning";
        else if (prof.status_aprovacao === "Reprovado") statusColor = "text-bg-danger";

        html += `
            <tr>
                <td class="fw-bold">
                    ${prof.nome}<br>
                    <small class="text-muted fw-normal">${prof.email}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${prof.especialidade}</span></td>
                <td class="text-muted">${prof.registro_profissional}</td>
                <td><span class="badge ${statusColor}">${statusTexto}</span></td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='analisar_documentacao.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-info border-0" title="Analisar Documentos">
                            <i class="bi bi-file-earmark-medical"></i>
                        </a>
                        <a href='alterar_profissional.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${prof.id_usuario})" class="btn btn-sm btn-outline-danger border-0">
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
    if (confirm("Deseja realmente remover este profissional do sistema? A exclusão removerá o acesso dele.")) {
        const retorno = await fetch("../../php/usuario_excluir.php?id=" + id);
        const resposta = await retorno.json();
        alert(resposta.mensagem);
        if (resposta.status === "ok") window.location.reload();
    }
}

// ==========================================
// LÓGICA DE LOGOFF (Sair)
// ==========================================
const btnLogoff = document.getElementById("logoff");

if (btnLogoff) {
    btnLogoff.addEventListener("click", async (event) => {
        event.preventDefault();
        
        try {
            // Caminho ABSOLUTO a partir da raiz do servidor. 
            // O navegador sempre vai achar o arquivo na pasta correta.
            const retorno = await fetch("/projeto-lumind/php/cliente_logoff.php");
            const resposta = await retorno.json();
            
            if (resposta.status === "ok") {
                // Caminho absoluto para a tela de login. 
                // Assumindo que a pasta login fica na raiz do projeto.
                window.location.href = '/projeto-lumind/login/'; 
            } else {
                alert("Erro ao tentar sair do sistema.");
            }
        } catch (erro) {
            console.error("Erro na requisição de logoff:", erro);
        }
    });
}