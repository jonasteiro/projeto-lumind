document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-alterar-responsavel");

    // Captura o ID da URL
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");

    if (id) {
        buscar(id);
    }

    // Função para buscar os dados no banco
    async function buscar(id) {
        try {
            // Ajuste o caminho do PHP conforme a estrutura do seu projeto
            const retorno = await fetch("../php/responsavel/responsavel_get.php?id=" + id);
            const resposta = await retorno.json();

            if (resposta.status === "ok") {
                const p = resposta.data[0];
                
                document.getElementById("id_usuario").value = id;
                document.getElementById("nome").value = p.nome;
                document.getElementById("email").value = p.email;
                document.getElementById("cpf").value = p.cpf; 
                
                if (p.telefone) {
                    document.getElementById("telefone").value = p.telefone;
                }
                
                if (p.data_nascimento) {
                    // Pega apenas a parte da data (YYYY-MM-DD) caso venha com hora do banco
                    document.getElementById("data_nascimento").value = p.data_nascimento.split(' ')[0];
                }

                // 1. GARANTE QUE A SENHA FIQUE EM BRANCO NA TELA
                document.getElementById("senha").value = ""; 

            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: "Erro: " + resposta.mensagem,
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        window.location.href = "lista_responsavel.html";
                    });
                } else {
                    alert("Erro: " + resposta.mensagem);
                    window.location.href = "lista_responsavel.html";
                }
            }
        } catch (e) {
            console.error("Erro ao buscar responsável:", e);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de Conexão',
                    text: 'Erro de conexão ao buscar dados.',
                    confirmButtonColor: '#d33'
                });
            }
        }
    }

    // Submissão do formulário
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Impede o redirecionamento automático

            // Limpa as mensagens de erro na tela
            const camposErro = ['erroNome', 'erroEmail', 'erroCpf', 'erroTelefone', 'erroData'];
            camposErro.forEach(idErro => {
                const el = document.getElementById(idErro);
                if(el) el.textContent = '';
            });

            // Captura os valores digitados
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const telefone = document.getElementById("telefone").value.trim();
            const data = document.getElementById("data_nascimento").value;
            const senha = document.getElementById("senha").value;
            let temErro = false;

            // Validações básicas
            if (nome.length < 3) { 
                const el = document.getElementById("erroNome");
                if (el) el.textContent = "Nome muito curto."; 
                temErro = true; 
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) { 
                const el = document.getElementById("erroEmail");
                if (el) el.textContent = "E-mail inválido."; 
                temErro = true; 
            }
            if (!data) { 
                const el = document.getElementById("erroData");
                if (el) el.textContent = "Data obrigatória."; 
                temErro = true; 
            }

            if (temErro) return;

            // Animação do botão carregando
            const btn = document.getElementById("btnEnviar");
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i> Salvando...';
            }

            // Preparação dos dados para envio
            const fd = new FormData();
            fd.append("id_usuario", document.getElementById("id_usuario").value);
            fd.append("nome", nome);
            fd.append("email", email);
            
            // Envia o CPF limpo (somente números) para o PHP não dar Warning
            fd.append("cpf", document.getElementById("cpf").value.replace(/\D/g, ''));
            
            // Envia o Telefone limpo
            fd.append("telefone", telefone.replace(/\D/g, ''));
            
            fd.append("data_nascimento", data);
            fd.append("senha", senha);

            try {
                // Ajuste o caminho do PHP
                const id_user = document.getElementById("id_usuario").value;
                const retorno = await fetch("../php/responsavel/responsavel_alterar.php?id=" + id_user, {
                    method: 'POST',
                    body: fd  
                });
                
                const resposta = await retorno.json();

                if (resposta.status === "ok" || resposta.status === "sucesso") {
                    // 2. EXIBE O ALERTA SWEET ALERT E REDIRECIONA
                    Swal.fire({
                        icon: 'success',
                        title: 'Atualizado!',
                        text: resposta.mensagem || 'Dados do responsável salvos com sucesso.',
                        confirmButtonColor: '#0284c7'
                    }).then(() => {
                        // Só muda de página quando o usuário clica no "OK" do SweetAlert
                        window.location.href = 'lista_responsavel.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao Salvar',
                        text: resposta.mensagem || 'Verifique os dados e tente novamente.',
                        confirmButtonColor: '#d33'
                    });
                }
            } catch (erro) {
                console.error("Erro na requisição:", erro);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro de Conexão',
                    text: 'Erro de comunicação com o servidor.',
                    confirmButtonColor: '#d33'
                });
            } finally {
                // Restaura o botão
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = "<i class='bi bi-save me-1'></i> Salvar Alterações";
                }
            }
        });
    }
});