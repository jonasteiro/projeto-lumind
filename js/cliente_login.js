document.addEventListener("DOMContentLoaded", () => {
    // Elementos da interface
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("senha");
    const eyeIcon = document.getElementById("eyeIcon");
    const formLogin = document.getElementById("form-login");
    const divErro = document.getElementById("erro-login");
    const btnEnviar = document.getElementById("enviar");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");

    // Lógica de Mostrar/Esconder Senha
    togglePassword.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        eyeIcon.classList.toggle("bi-eye");
        eyeIcon.classList.toggle("bi-eye-slash");
    });

    // Função auxiliar para mostrar erros na tela
    const mostrarErro = (mensagem) => {
        divErro.textContent = mensagem;
        divErro.classList.remove("d-none");
    };

    // Lógica de Submissão Segura
    formLogin.addEventListener("submit", async (event) => {
        // ESSENCIAL: Impede que o formulário recarregue a página
        event.preventDefault(); 
        
        // Limpa erros anteriores e trava o botão (evita duplo clique)
        divErro.classList.add("d-none");
        btnText.classList.add("d-none");
        btnSpinner.classList.remove("d-none");
        btnEnviar.disabled = true;

        const email = document.getElementById("email").value;
        const senha = passwordInput.value;
        
        const fd = new FormData();
        fd.append("email", email);
        fd.append("senha", senha);

        try {
            const retorno = await fetch("../php/cliente_login.php", {
                method: "POST",
                body: fd
            });

            // Verifica se a resposta HTTP não foi um erro (ex: 404, 500)
            if (!retorno.ok) {
                throw new Error(`Erro no servidor: ${retorno.status}`);
            }

            const resposta = await retorno.json();

            if (resposta.status === "ok") {
                window.location.href = "../home/";
            } else {
                mostrarErro("Credenciais inválidas. Verifique seu usuário e senha.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            mostrarErro("Erro de conexão. Tente novamente mais tarde.");
        } finally {
            // Restaura o botão independentemente de sucesso ou falha
            btnText.classList.remove("d-none");
            btnSpinner.classList.add("d-none");
            btnEnviar.disabled = false;
        }
    });
});