const formulario = document.getElementById("form-alterar-admin");
const divErro = document.getElementById("divErro");
const divSucesso = document.getElementById("divSucesso");

document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) buscar(id);
});

// ================= VALIDAÇÕES =================
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf) {
    const apenasNumeros = cpf.replace(/\D/g, '');
    return apenasNumeros.length === 11;
}

function mostrarMensagem(tipo, msg) {
    const div = tipo === 'erro' ? divErro : divSucesso;
    const outra = tipo === 'erro' ? divSucesso : divErro;
    
    div.textContent = msg;
    div.classList.add('show');
    outra.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= FASE 1: BUSCA =================
async function buscar(id) {
    const retorno = await fetch("../php/admin/administrador_get.php?id=" + id);
    const resposta = await retorno.json();

    if (resposta.status == "ok") {
        const registro = resposta.data[0];
        document.getElementById("id_usuario").value = id;
        document.getElementById("nome").value = registro.nome;
        document.getElementById("email").value = registro.email;
        document.getElementById("cpf").value = registro.cpf;
        document.getElementById("data_nascimento").value = registro.data_nascimento;
        document.getElementById("status_adm").checked = (registro.status_adm == 1);
    } else {
        alert("Erro: " + resposta.mensagem);
        window.location.href = "lista_admin.html";
    }
}

// ================= FASE 2: ALTERAÇÃO =================
formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Limpar erros visuais
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
    
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    let temErro = false;

    // Gatilhos de Erro
    if (nome.length < 3) {
        document.getElementById("erroNome").textContent = "Nome muito curto.";
        document.getElementById("erroNome").classList.add("show");
        temErro = true;
    }
    if (!validarEmail(email)) {
        document.getElementById("erroEmail").textContent = "E-mail inválido.";
        document.getElementById("erroEmail").classList.add("show");
        temErro = true;
    }
    if (!validarCPF(cpf)) {
        document.getElementById("erroCpf").textContent = "CPF deve ter 11 dígitos.";
        document.getElementById("erroCpf").classList.add("show");
        temErro = true;
    }
    if (!data) {
        document.getElementById("erroData").textContent = "Data obrigatória.";
        document.getElementById("erroData").classList.add("show");
        temErro = true;
    }
    if (senha.length > 0 && senha.length < 6) {
        alert("A nova senha deve ter no mínimo 6 caracteres.");
        temErro = true;
    }

    if (temErro) return;

    // Envio para o PHP
    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando...";

    const fd = new FormData();
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("cpf", cpf.replace(/\D/g, ''));
    fd.append("data_nascimento", data);
    fd.append("senha", senha);
    fd.append("status_adm", document.getElementById("status_adm").checked ? 1 : 0);

    try {
        const id = document.getElementById("id_usuario").value;
        const retorno = await fetch("../php/admin/administrador_alterar.php?id=" + id, {
            method: 'POST',
            body: fd  
        });
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            mostrarMensagem('sucesso', "✅ " + resposta.mensagem);
            setTimeout(() => { window.location.href = 'lista_admin.html'; }, 2000);
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }
    } catch (e) {
        mostrarMensagem('erro', "❌ Erro de conexão com o servidor.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bi bi-save me-2'></i> Salvar Alterações";
    }
});

// Máscara básica para CPF
document.getElementById('cpf').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    e.target.value = value;
});