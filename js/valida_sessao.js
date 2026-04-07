async function validarAcesso(tipoPermitido) {
    try {
        // Ajuste o caminho do fetch conforme a necessidade do seu servidor local
        const retorno = await fetch("/projeto-lumind/php/valida_sessao.php");
        const resposta = await retorno.json();

        if (resposta.status === "nok") {
            console.error("Sessão não encontrada no PHP.");
            window.location.href = "../login/index.html?erro=sem_sessao";
            return;
        }

        const usuarioLogado = resposta.usuario;

        // VALIDAÇÃO DE PERFIS CORRIGIDA
        if (tipoPermitido) {
            // Se o parâmetro não for um array, transforma ele em um array de 1 item
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];

            // Verifica se o tipo do usuário logado está DENTRO da lista de perfis aceitos
            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                alert("ACESSO NEGADO!\nSeu Perfil: " + usuarioLogado.tipo_usuario + "\nExigido: " + perfisAceitos.join(" ou "));
                window.location.href = "../login/index.html?erro=acesso_negado";
                return;
            }
        }

        // Preenche o nome na tela se o elemento existir
        const nomeExibicao = document.getElementById("nome-usuario");
        if (nomeExibicao) {
            nomeExibicao.textContent = usuarioLogado.nome;
        }

    } catch (e) {
        console.error("Erro ao processar JSON:", e);
    }
}