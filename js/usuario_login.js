document.addEventListener("DOMContentLoaded", () => {
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("senha");
    const eyeIcon = document.getElementById("eyeIcon");
    const formLogin = document.getElementById("form-login");
    const divErro = document.getElementById("erro-login");
    const btnEnviar = document.getElementById("enviar");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            eyeIcon.classList.toggle("bi-eye");
            eyeIcon.classList.toggle("bi-eye-slash");
        });
    }

    // Helper de erro
    const mostrarErro = (mensagem) => {
        divErro.textContent = mensagem;
        divErro.classList.remove("d-none");
    };

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        
        // UI Feedback: Trava botão e mostra spinner
        divErro.classList.add("d-none");
        btnText.classList.add("d-none");
        btnSpinner.classList.remove("d-none");
        btnEnviar.disabled = true;

        const fd = new FormData(formLogin);

        try {
            // Ajuste o caminho para o seu PHP centralizado
            const retorno = await fetch("../php/usuario_login.php", {
                method: "POST",
                body: fd
            });

            if (!retorno.ok) throw new Error(`Erro: ${retorno.status}`);

            const resposta = await retorno.json();

            if (resposta.status === "ok") {
                // REDIRECIONAMENTO INTELIGENTE
                const tipo = resposta.data.tipo_usuario;
                
                // Mapeamento de rotas
                const rotas = {
                    'Administrador': '../home/tela_administrador.html',
                    'ProfissionalSaude': '../home/tela_profissional.html',
                    'ResponsavelLegal': '../home/tela_responsavel.html',
                    'PessoaTea': '../home/tela_pessoa_tea.html' // Ajuste conforme sua pasta
                };

                window.location.href = rotas[tipo] || '../index.html';
                
            } else {
                mostrarErro(resposta.mensagem || "Credenciais inválidas.");
            }
        } catch (error) {
            console.error("Erro:", error);
            mostrarErro("Erro de conexão ou erro interno no servidor.");
        } finally {
            // Restaura o botão
            btnText.classList.remove("d-none");
            btnSpinner.classList.add("d-none");
            btnEnviar.disabled = false;
        }
    });
});