// UTILITÁRIO — Extrai as 2 primeiras palavras do nome completo
function formatarNomeUsuario(nomeCompleto) {
    if (!nomeCompleto || typeof nomeCompleto !== 'string') return '';
    const partes = nomeCompleto.trim().split(/\s+/);
    return partes.slice(0, 2).join(' ');
}

// RENDERIZAÇÃO INSTANTÂNEA — Cenário 3 (sem nova query ao banco)
// Lê do sessionStorage antes de qualquer fetch, eliminando
// o flash de "Carregando..." ao trocar de página.
(function renderizarNomeInstantaneo() {
    const nomeSalvo = sessionStorage.getItem('lumind_nome_usuario');
    if (nomeSalvo) {
        const el = document.getElementById('nome-usuario');
        if (el) el.textContent = nomeSalvo;
    }
})();

// VALIDAÇÃO DE ACESSO E SESSÃO
async function validarAcesso(tipoPermitido) {
    try {
        const retorno  = await fetch("../php/valida_sessao.php");
        const resposta = await retorno.json();

        if (resposta.status === "nok") {
            sessionStorage.removeItem('lumind_nome_usuario');
            window.location.href = "../login/index.html?erro=sem_sessao";
            return;
        }

        const usuarioLogado = resposta.usuario;

        // Verifica permissão de perfil
        if (tipoPermitido) {
            const perfisAceitos = Array.isArray(tipoPermitido) ? tipoPermitido : [tipoPermitido];
            if (!perfisAceitos.includes(usuarioLogado.tipo_usuario)) {
                alert("ACESSO NEGADO!\nSeu Perfil: " + usuarioLogado.tipo_usuario + "\nExigido: " + perfisAceitos.join(" ou "));
                window.location.href = "../login/index.html?erro=acesso_negado";
                return;
            }
        }

        // Formata e persiste no sessionStorage — Cenário 3
        const nomeFormatado = formatarNomeUsuario(usuarioLogado.nome);
        sessionStorage.setItem('lumind_nome_usuario', nomeFormatado);

        // Injeta no elemento id="nome-usuario" onde existir
        const elNome = document.getElementById('nome-usuario');
        if (elNome) elNome.textContent = nomeFormatado;

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
                const retorno  = await fetch("../php/usuario_logoff.php");
                const resposta = await retorno.json();
                if (resposta.status === "ok") {
                    sessionStorage.removeItem('lumind_nome_usuario');
                    window.location.href = '/projeto-lumind/login.html';
                }
            } catch (error) {
                console.error("Erro na requisição de logoff:", error);
            }
        });
    }
});