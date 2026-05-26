/* ==========================================================================
   index.js — Script Global do Sistema (Carregado em todas as telas)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Validação de Sessão Genérica (Se existir na tela)
    if (typeof valida_sessao === "function") {
        valida_sessao();
    }
    
    // 2. Lógica Global do Botão de Logoff
    // Procura qualquer botão com id="logoff" na tela e aplica a função de saída
    const btnLogoff = document.getElementById("logoff");
    if (btnLogoff) {
        btnLogoff.addEventListener("click", (event) => {
            event.preventDefault();
            executarLogoff();
        });
    }
});

// =======================================================
// FUNÇÃO GLOBAL DE SAÍDA (LOGOFF)
// =======================================================
async function executarLogoff() {
    try {
        // CORREÇÃO: Usar caminho absoluto a partir do "htdocs" do XAMPP
        const retorno = await fetch("/projeto-lumind/php/cliente_logoff.php"); 
        const resposta = await retorno.json();
        
        if (resposta.status === "ok") {
            // Caminho absoluto para garantir que funciona de qualquer pasta
            window.location.href = '/projeto-lumind/login/index.html'; 
        } else {
            console.error("Falha ao destruir a sessão no servidor.");
            alert("Erro ao tentar sair do sistema.");
        }
    } catch (error) {
        console.error("Erro na requisição de logoff:", error);
    }
}