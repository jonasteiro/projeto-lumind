
async function validarAcesso(tipoPermitido) {
    try {
        const retorno = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        // 1. Não está logado? Expulsa.
        if (resposta.status === "nok") {
            window.location.href = "../login/index.html";
            return;
        }

        // 2. Está logado, mas é o tipo errado? Expulsa.
        const usuarioLogado = resposta.usuario;
        
        if (tipoPermitido && usuarioLogado.tipo_usuario !== tipoPermitido) {
            // Se um Profissional tentar entrar no Admin, cai aqui
            window.location.href = "../login/index.html?erro=acesso_negado";
        }

        // 3. Se quiser exibir o nome do usuário na tela (opcional)
        const nomeExibicao = document.getElementById("nome-usuario");
        if (nomeExibicao) {
            nomeExibicao.textContent = usuarioLogado.nome;
        }

    } catch (e) {
        window.location.href = "../login/index.html";
    }
}