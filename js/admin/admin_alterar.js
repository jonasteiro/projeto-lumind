const formulario = document.getElementById("form-alterar-admin");
const divErro = document.getElementById("divErro");
const divSucesso = document.getElementById("divSucesso");

document.addEventListener("DOMContentLoaded", () => {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    if (id) buscar(id);
});

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenhaForte(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
}

function mostrarMensagem(tipo, msg) {
    const div = tipo === 'erro' ? divErro : divSucesso;
    const outra = tipo === 'erro' ? divSucesso : divErro;

    div.textContent = msg;
    div.classList.remove('d-none');
    outra.classList.add('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparErrosInputs() {
    const mensagensErro = ['erroNome', 'erroEmail', 'erroData', 'erroSenha'];
    mensagensErro.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

async function buscar(id) {
    try {
        const retorno = await fetch("../php/admin/administrador_get.php?id=" + id);
        const resposta = await retorno.json();

        if (resposta.status === "ok" && resposta.data.length > 0) {
            const adm = resposta.data[0];

            document.getElementById("id_usuario").value = id;
            document.getElementById("nome").value = adm.nome || "";
            document.getElementById("email").value = adm.email || "";

            if (adm.data_nascimento) {
                document.getElementById("data_nascimento").value = adm.data_nascimento.split(' ')[0];
            }

            document.getElementById("status_adm").checked = (adm.status_adm == 1 || adm.status_adm === "1");
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: resposta.mensagem || 'Administrador não encontrado.',
                confirmButtonColor: '#167ebc'
            }).then(() => {
                window.location.href = "lista_administrador.html";
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
        Swal.fire('Erro', 'Falha na comunicação com o servidor ao carregar dados.', 'error');
    }
}

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErrosInputs();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    let temErro = false;

    if (nome.length < 3) {
        document.getElementById("erroNome").textContent = "Nome muito curto.";
        temErro = true;
    }
    if (!validarEmail(email)) {
        document.getElementById("erroEmail").textContent = "E-mail inválido.";
        temErro = true;
    }
    if (!data) {
        document.getElementById("erroData").textContent = "Data obrigatória.";
        temErro = true;
    }
    if (senha.length > 0 && !validarSenhaForte(senha)) {
        document.getElementById("erroSenha").textContent = "A senha não atende aos requisitos de segurança.";
        temErro = true;
    }

    if (temErro) return;

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando...";

    const fd = new FormData();
    fd.append("id_usuario", document.getElementById("id_usuario").value);
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("data_nascimento", data);
    fd.append("senha", senha);
    fd.append("status_adm", document.getElementById("status_adm").checked ? 1 : 0);

    try {
        const retorno = await fetch("../php/admin/administrador_alterar.php", {
            method: 'POST',
            body: fd
        });

        const text = await retorno.text();
        const resposta = JSON.parse(text);

        if (resposta.status === "ok") {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: resposta.mensagem || 'Dados atualizados com êxito!',
                confirmButtonColor: '#167ebc',
                allowOutsideClick: false
            }).then(() => {
                window.location.href = 'lista_administrador.html';
            });
        } else {
            mostrarMensagem('erro', "❌ " + resposta.mensagem);
        }
    } catch (e) {
        console.error("Erro no envio:", e);
        mostrarMensagem('erro', "❌ Erro de conexão com o servidor ao salvar.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bi bi-save me-1'></i> Salvar Alterações";
    }
});

// Limpa erro de senha ao digitar
document.getElementById('senha').addEventListener('input', function () {
    if (this.value === '' || validarSenhaForte(this.value)) {
        document.getElementById('erroSenha').textContent = "";
    }
});

if (typeof validarAcesso === "function") {
    validarAcesso(['Administrador']);
}