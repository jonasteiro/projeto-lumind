// UTILITÁRIO — Extrai as 2 primeiras palavras do nome completo
function formatarNomeUsuario(nomeCompleto) {
    if (!nomeCompleto || typeof nomeCompleto !== 'string') return '';
    const partes = nomeCompleto.trim().split(/\s+/);
    return partes.slice(0, 2).join(' ');
}

// UTILITÁRIO — Gera as iniciais para o avatar (ex: "João Silva" → "JS")
function gerarIniciais(nomeCompleto) {
    if (!nomeCompleto || typeof nomeCompleto !== 'string') return '--';
    const partes = nomeCompleto.trim().split(/\s+/);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// RENDERIZAÇÃO INSTANTÂNEA — lê do sessionStorage antes de qualquer fetch
(function renderizarNomeInstantaneo() {
    const nomeSalvo = sessionStorage.getItem('lumind_nome_usuario');
    if (nomeSalvo) {
        const el = document.getElementById('nome-usuario');
        if (el) el.textContent = nomeSalvo;

        const elSidebar = document.getElementById('sidebarNome');
        if (elSidebar) elSidebar.textContent = nomeSalvo;

        const elAvatar = document.getElementById('sidebarAvatar');
        if (elAvatar) elAvatar.textContent = gerarIniciais(nomeSalvo);
    }
})();

// VALIDAÇÃO DE ACESSO E SESSÃO
async function validarAcesso(tipoPermitido) {
    try {
        const retorno  = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        if (resposta.status === "nok") {
            window.location.href = `${BASE_URL}/login/index.html?erro=sem_sessao`;
            return;
        }

        const usuarioLogado = resposta.usuario;

        if (tipoPermitido) {
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];
            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                window.location.href = `${BASE_URL}/login/index.html?erro=acesso_negado`;
                return;
            }
        }

        const nomeFormatado = formatarNomeUsuario(usuarioLogado.nome);
        sessionStorage.setItem('lumind_nome_usuario', nomeFormatado);

        // Injeta no id="nome-usuario" (padrão antigo)
        const elNome = document.getElementById('nome-usuario');
        if (elNome) elNome.textContent = nomeFormatado;

        // Injeta no id="sidebarNome" (topbar das telas de edição)
        const elSidebar = document.getElementById('sidebarNome');
        if (elSidebar) elSidebar.textContent = nomeFormatado;

        // Gera e injeta as iniciais no avatar
        const elAvatar = document.getElementById('sidebarAvatar');
        if (elAvatar) elAvatar.textContent = gerarIniciais(usuarioLogado.nome);

        document.body.style.display = "block";

    } catch (e) {
        console.error("Erro ao processar sessão:", e);
    }
}

// LOGOFF — limpa sessionStorage ao sair
document.addEventListener("DOMContentLoaded", () => {
    const btnLogoff = document.getElementById("logoff");
    if (btnLogoff) {
        btnLogoff.addEventListener("click", async (event) => {
            event.preventDefault();
            try {
                const retorno = await fetch(`${BASE_URL}/php/usuario_logoff.php`);
                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    window.location.href = `${BASE_URL}/login/index.html`;
                }
            } catch (error) {
                console.error("Erro na requisição de logoff:", error);
            }
        });
    }
});