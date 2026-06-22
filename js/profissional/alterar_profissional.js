const formulario = document.getElementById("form-alterar-profissional");
const IDADE_MINIMA = 21;

document.addEventListener("DOMContentLoaded", () => {
    // =======================================================
    // BLOQUEIO DE DATAS NO CALENDÁRIO (Mínimo 21 Anos)
    // =======================================================
    const inputData = document.getElementById("data_nascimento");
    if (inputData) {
        const dataLimite = new Date();
        dataLimite.setFullYear(dataLimite.getFullYear() - IDADE_MINIMA);
        
        const ano = dataLimite.getFullYear();
        const mes = String(dataLimite.getMonth() + 1).padStart(2, '0');
        const dia = String(dataLimite.getDate()).padStart(2, '0');
        
        // Impede de selecionar no calendário uma data menor que 21 anos atrás
        inputData.setAttribute('max', `${ano}-${mes}-${dia}`); 
    }

    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");

    if (id) {
        document.getElementById("id_usuario").value = id;
        buscarProfissional(id);
    } else {
        window.location.href = "listar-profissionais.html";
    }
});

function limparErrosInputs() {
    const mensagensErro = ['erroNome', 'erroEmail', 'erroData', 'erroRegistro', 'erroEspecialidade'];
    mensagensErro.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

async function buscarProfissional(id) {
    try {
        const retorno = await fetch(`../../php/profissional/listar-profissionais.php?id=${id}`);
        const resposta = await retorno.json();

        if (resposta.status === "ok" && resposta.data.length > 0) {
            const prof = resposta.data[0];

            document.getElementById("id_usuario").value = id;
            document.getElementById("nome").value = prof.nome || "";
            document.getElementById("email").value = prof.email || "";
            document.getElementById("registro_profissional").value = prof.registro_profissional || "";

            if (prof.data_nascimento) {
                document.getElementById("data_nascimento").value = prof.data_nascimento.split(' ')[0];
            }

            const selectEspecialidade = document.getElementById("especialidade");
            const valorBanco = prof.especialidade ? prof.especialidade.trim() : "";

            if (valorBanco !== "") {
                let opcaoExiste = false;
                for (let i = 0; i < selectEspecialidade.options.length; i++) {
                    if (selectEspecialidade.options[i].value === valorBanco) {
                        opcaoExiste = true;
                        break;
                    }
                }

                if (!opcaoExiste) {
                    const novaOpcao = document.createElement("option");
                    novaOpcao.value = valorBanco;
                    novaOpcao.textContent = valorBanco;
                    selectEspecialidade.appendChild(novaOpcao);
                }

                selectEspecialidade.value = valorBanco;
            }

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: resposta.mensagem || 'Profissional não encontrado.',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = "listar-profissionais.html";
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

    const id_usuario = document.getElementById("id_usuario").value;
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const data = document.getElementById("data_nascimento").value;
    const senha = document.getElementById("senha").value;
    const registro = document.getElementById("registro_profissional").value.trim();
    const especialidade = document.getElementById("especialidade").value;

    let temErro = false;

    if (nome.length < 3) { document.getElementById("erroNome").textContent = "Nome muito curto."; temErro = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById("erroEmail").textContent = "E-mail inválido."; temErro = true; }
    if (!registro) { document.getElementById("erroRegistro").textContent = "Registro obrigatório."; temErro = true; }
    if (!especialidade) { document.getElementById("erroEspecialidade").textContent = "Selecione uma especialidade."; temErro = true; }
    if (senha.length > 0 && senha.length < 6) { Swal.fire('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.', 'warning'); temErro = true; }

    // Validação rigorosa de Data de Nascimento (Idade Mínima 21 Anos)
    if (!data) { 
        document.getElementById("erroData").textContent = "Data obrigatória."; 
        temErro = true; 
    } else {
        const dataNasc = new Date(data);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();

        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        const mesNasc = dataNasc.getMonth();
        const diaNasc = dataNasc.getDate();

        // Subtrai 1 ano se o mês/dia atual for menor que o mês/dia do aniversário
        if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
            idade--;
        }

        if (idade < IDADE_MINIMA) {
            document.getElementById("erroData").textContent = `O profissional deve ter no mínimo ${IDADE_MINIMA} anos de idade.`; 
            temErro = true;
        }
    }

    if (temErro) return;

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;
    btn.innerHTML = "⏳ Salvando...";

    const fd = new FormData();
    fd.append("id_usuario", id_usuario);
    fd.append("nome", nome);
    fd.append("email", email);
    fd.append("data_nascimento", data);
    fd.append("senha", senha);
    fd.append("registro_profissional", registro);
    fd.append("especialidade", especialidade);

    try {
        const retorno = await fetch("../../php/profissional/alterar_profissional.php", {
            method: 'POST',
            body: fd
        });
        const resposta = await retorno.json();

        if (resposta.status == "ok") {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: resposta.mensagem || 'Profissional atualizado com êxito!',
                confirmButtonColor: '#0284c7'
            }).then(() => {
                window.location.href = 'listar-profissionais.html';
            });
        } else {
            Swal.fire('Ops!', resposta.mensagem, 'error');
        }
    } catch (e) {
        console.error("Erro no envio:", e);
        Swal.fire('Erro', 'Erro de conexão com o servidor ao salvar.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bi bi-save me-1'></i> Salvar Alterações";
    }
});