// valida_sessao.js

// FIX: Criação de uma constante base para garantir o roteamento absoluto em qualquer nível de pasta. Isso mata o erro de 404 em telas aninhadas.
const BASE_URL = '/projeto-lumind';

async function validarAcesso(tipoPermitido) {
    try {
        // FIX: Substituição do caminho relativo '../' pela variável absoluta BASE_URL.
        const retorno = await fetch(`${BASE_URL}/php/valida_sessao.php`);
        const resposta = await retorno.json();

        // 1. Se não estiver logado, expulsa
        if (resposta.status === "nok") {
            // FIX: Redirecionamento absoluto, evitando falhas de rota em pastas aninhadas.
            window.location.href = `${BASE_URL}/login/index.html?erro=sem_sessao`;
            return;
        }

        const usuarioLogado = resposta.usuario;

        // 2. Validação de Regra de Negócio (RBAC)
        if (tipoPermitido) {
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];

            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                // FIX: Redirecionamento absoluto.
                window.location.href = `${BASE_URL}/login/index.html?erro=acesso_negado`;
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
        // FIX: Redirecionamento absoluto. Quando a sessão de fato quebrar no servidor, o usuário será levado à tela real de login.
        window.location.href = `${BASE_URL}/login/index.html?erro=erro_servidor`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnLogoff = document.getElementById("logoff");
    
    if (btnLogoff) {
        btnLogoff.addEventListener("click", async (event) => {
            event.preventDefault(); 
            
            try {
                // FIX: Utilização do BASE_URL na API de logoff.
                const retorno = await fetch(`${BASE_URL}/php/usuario_logoff.php`);
                const resposta = await retorno.json();
                
                if (resposta.status === "ok") {
                    // FIX: Padronização do arquivo de destino.
                    window.location.href = `${BASE_URL}/login/index.html`; 
                }
            } catch (error) {
                console.error("Erro na requisição de logoff:", error);
            }
        });
    }
});