async function validarAcesso(tipoPermitido) {
    try {
        const retorno = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        // 1. Se não estiver logado, expulsa
        if (resposta.status === "nok") {
            window.location.href = "../login/index.html?erro=sem_sessao";
            return;
        }

        const usuarioLogado = resposta.usuario;

        // 2. Validação de Regra de Negócio (RBAC)
        if (tipoPermitido) {
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];

            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                // Removemos o alert() para não travar a tela com o HTML vazado no fundo
                window.location.href = "../login/index.html?erro=acesso_negado";
                return;
            }
        }

        // 3. PBI 12 - Injeta o Nome no Header
        const nomeExibicao = document.getElementById("nome-usuario");
        if (nomeExibicao) {
            nomeExibicao.textContent = usuarioLogado.nome;
        }

        // 4. Libera a visualização da tela após garantir que é a pessoa certa
        document.body.style.display = "block";

    } catch (e) {
        console.error("Erro ao processar JSON:", e);
        // Em caso de erro de servidor, por segurança, joga para o login
        window.location.href = "../login/index.html?erro=erro_servidor";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnLogoff = document.getElementById("logoff");
    
    if (btnLogoff) {
        btnLogoff.addEventListener("click", async (event) => {
            event.preventDefault(); 
            
            try {
                const retorno = await fetch("../php/usuario_logoff.php");
                const resposta = await retorno.json();
                
                if (resposta.status === "ok") {
                    window.location.href = '/projeto-lumind/login.html'; 
                }
            } catch (error) {
                console.error("Erro na requisição de logoff:", error);
            }
        });
    }
});