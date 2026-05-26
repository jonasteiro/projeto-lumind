document.addEventListener("DOMContentLoaded", () => {
    const btnSolicitar = document.getElementById("btn-solicitar-pin");
    const btnRedefinir = document.getElementById("btn-redefinir");
    const alerta = document.getElementById("alerta-recuperacao");

    // CORREÇÃO: Cor padrão para os botões do SweetAlert (Azul Lumind)
    const corAzulLumind = '#167ebc';

    function mostrarAlerta(msg, tipo = "danger") {
        alerta.textContent = msg;
        alerta.className = `alert alert-${tipo} py-2`;
        alerta.classList.remove("d-none");
    }

    btnSolicitar.addEventListener("click", async () => {
        const email = document.getElementById("email_recuperacao").value.trim();
        if (!email) {
            mostrarAlerta("Por favor, digite seu e-mail.");
            return;
        }

        btnSolicitar.disabled = true;
        btnSolicitar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';
        alerta.classList.add("d-none");

        const fd = new FormData();
        fd.append("email", email);

        try {
            const res = await fetch("../php/login/solicitar_recuperacao.php", { method: "POST", body: fd });
            const data = await res.json();

            if (data.status === "ok") {
                document.getElementById("etapa-1").classList.add("d-none");
                document.getElementById("etapa-2").classList.remove("d-none");
                
                // CORREÇÃO: Alerta em azul-claro (info) para manter o padrão
                mostrarAlerta(`Código gerado! (PIN Teste: ${data.pin_teste})`, "info");
            } else {
                mostrarAlerta(data.mensagem);
            }
        } catch (e) {
            mostrarAlerta("Erro de conexão com o servidor.");
        } finally {
            btnSolicitar.disabled = false;
            btnSolicitar.innerHTML = 'Enviar Código';
        }
    });

    btnRedefinir.addEventListener("click", async () => {
        const email = document.getElementById("email_recuperacao").value.trim();
        const pin = document.getElementById("pin_seguranca").value.trim();
        const senha = document.getElementById("nova_senha").value;

        if (pin.length !== 6 || senha.length < 6) {
            mostrarAlerta("O código deve ter 6 dígitos e a senha no mínimo 6 caracteres.");
            return;
        }

        btnRedefinir.disabled = true;
        btnRedefinir.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';
        alerta.classList.add("d-none");

        const fd = new FormData();
        fd.append("email", email);
        fd.append("pin", pin);
        fd.append("nova_senha", senha);

        try {
            const res = await fetch("../php/login/redefinir_senha.php", { method: "POST", body: fd });
            const data = await res.json();

            if (data.status === "ok") {
                // CORREÇÃO: Alerta visual com botão azul (btn-primary) e ícone azul (text-primary)
                document.getElementById("etapa-2").innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-check-circle-fill text-primary" style="font-size: 3rem;"></i>
                        <h5 class="mt-3 fw-bold text-dark">Senha Alterada!</h5>
                        <p class="text-muted">Sua senha foi redefinida com sucesso.</p>
                        <button type="button" class="btn btn-primary rounded-pill px-4 mt-2" data-bs-dismiss="modal">Fazer Login</button>
                    </div>
                `;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: data.mensagem,
                    confirmButtonColor: corAzulLumind // CORREÇÃO: SweetAlert Azul
                });
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Falha',
                text: 'Erro de comunicação com o servidor.',
                confirmButtonColor: corAzulLumind // CORREÇÃO: SweetAlert Azul
            });
        } finally {
            btnRedefinir.disabled = false;
            btnRedefinir.innerHTML = 'Salvar Nova Senha';
        }
    });
});