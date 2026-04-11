async function validarAcesso(tipoPermitido) {
    try {
        const retorno = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        if (resposta.status === "nok") {
            window.location.href = "../login/index.html?erro=sem_sessao";
            return;
        }

        const usuarioLogado = resposta.usuario;

        if (tipoPermitido) {
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];

            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                alert("ACESSO NEGADO!\nSeu Perfil: " + usuarioLogado.tipo_usuario + "\nExigido: " + perfisAceitos.join(" ou "));
                window.location.href = "../login/index.html?erro=acesso_negado";
                return;
            }
        }

        const nomeExibicao = document.getElementById("nome-usuario");
        if (nomeExibicao) {
            nomeExibicao.textContent = usuarioLogado.nome;
        }

    } catch (e) {
        console.error("Erro ao processar JSON:", e);
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