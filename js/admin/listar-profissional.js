document.addEventListener("DOMContentLoaded", () => {
    buscarProfissionais();

    document.getElementById("btnNovoProfissional").addEventListener("click", () => {
        window.location.href = 'cadastro_profissional.html';
    });
});

async function buscarProfissionais() {
    const listaDiv = document.getElementById("lista");
    
    try {
        // Altere o endpoint de acordo com sua API PHP
        const retorno = await fetch("../php/profissional/get-profissional.php");
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
                    <th class="py-3">Registro</th>
                    <th class="py-3">Documentação</th>
                    <th class="py-3 text-end">Ações</th>
                </tr>
            </thead>
            <tbody>`;

    dados.forEach(prof => {
        // Lógica de cores baseada no ENUM do banco (Documentacao -> status_aprovacao)
        let statusClass = "bg-secondary";
        let statusTexto = prof.status_aprovacao || "Sem envio";

        if (prof.status_aprovacao === "Aprovado") statusClass = "badge-aprovado";
        else if (prof.status_aprovacao === "Aguardando") statusClass = "badge-aguardando";
        else if (prof.status_aprovacao === "Reprovado") statusClass = "badge-reprovado";

        html += `
            <tr>
                <td class="fw-bold">
                    ${prof.nome}<br>
                    <small class="text-muted fw-normal">${prof.email}</small>
                </td>
                <td>${prof.especialidade}</td>
                <td>${prof.registro_profissional}</td>
                <td><span class="badge ${statusClass}">${statusTexto}</span></td>
                <td class="text-end">
                    <div class="btn-group">
                        <a href='analisar_documentacao.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-info border-0" title="Analisar Documentos">
                            <i class="bi bi-file-earmark-medical"></i>
                        </a>
                        <a href='alterar_profissional.html?id=${prof.id_usuario}' class="btn btn-sm btn-outline-primary border-0" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <button onclick="excluir(${prof.id_usuario})" class="btn btn-sm btn-outline-danger border-0" title="Excluir">
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
    if (confirm("ATENÇÃO: Deseja realmente remover este profissional de saúde do Lumind? Isso pode impactar relatórios existentes.")) {
        // Usando a mesma rota de exclusão de usuário (já que exclui em cascata se configurado no banco)
        const retorno = await fetch("../php/usuario_excluir.php?id=" + id);
        const resposta = await retorno.json();
        
        alert(resposta.mensagem);
        if (resposta.status === "ok") window.location.reload();
    }
}

validarAcesso('Administrador');