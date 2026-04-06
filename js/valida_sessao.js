async function validarAcesso(tipoPermitido) {
    try {
        const retorno = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        

        if (resposta.status === "nok") {
            console.error("Sessão não encontrada no PHP.");
            window.location.href = "../login/index.html?erro=sem_sessao";
            return;
        }

        const usuarioLogado = resposta.usuario;
        
        

        if (tipoPermitido && usuarioLogado.tipo_usuario !== tipoPermitido) {
            // Se cair aqui, o console vai te mostrar a diferença (espaços, letras maiúsculas, etc)
            alert("CONFLITO!\nBanco: " + usuarioLogado.tipo_usuario + "\nExigido: " + tipoPermitido);
            window.location.href = "../login/index.html?erro=acesso_negado";
            return;
        }


        const nomeExibicao = document.getElementById("nome-usuario");
        if (nomeExibicao) {
            nomeExibicao.textContent = usuarioLogado.nome;
        }

    } catch (e) {
        console.error("Erro ao processar JSON:", e);
    }
}