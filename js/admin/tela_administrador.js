/* ==========================================================================
   tela_administrador.js — Lógica principal do Dashboard do Administrador
   ========================================================================== */

// 1. Validação de Segurança (Executa imediatamente)
if (typeof validarAcesso === "function") {
    validarAcesso(['Administrador']);
}

// 2. Busca a sessão no PHP e altera a Navbar Vertical
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const retorno = await fetch("../php/get_sessao.php");
        const resposta = await retorno.json();
        
        if (resposta.status === "ok" && resposta.nome) {
            // Preenche o nome
            document.getElementById("sidebarNome").textContent = resposta.nome;
            
            // Gera as iniciais para o avatar (Ex: Lucas Oliveira -> LO)
            const partesNome = resposta.nome.trim().split(" ");
            let iniciais = partesNome[0].charAt(0).toUpperCase();
            
            if (partesNome.length > 1) {
                iniciais += partesNome[partesNome.length - 1].charAt(0).toUpperCase();
            }
            
            document.getElementById("sidebarAvatar").textContent = iniciais;
        } else {
            document.getElementById("sidebarNome").textContent = "Administrador";
            document.getElementById("sidebarAvatar").textContent = "AD";
        }
    } catch (erro) {
        console.error("Erro ao buscar a sessão:", erro);
        document.getElementById("sidebarNome").textContent = "Administrador";
        document.getElementById("sidebarAvatar").textContent = "AD";
    }
});