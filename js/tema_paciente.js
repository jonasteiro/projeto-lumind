/**
 * tema_paciente.js
 * MOTOR SUPREMO COM YOUTUBE API 
 * Gerencia: Cores, Fontes, Modo Escuro, Leitura por Voz, Cursores e Rádio do YouTube.
 */

// =========================================================
// 1. INTEGRAÇÃO COM A API DO YOUTUBE (Cria o rádio invisível)
// =========================================================
let ytPlayer;
let ytReady = false;
let musicaPendente = false; // Guarda o play caso a API demore a carregar

// Injeta o script oficial do YouTube na página
const scriptAPI = document.createElement('script');
scriptAPI.src = "https://www.youtube.com/iframe_api";
const firstScript = document.getElementsByTagName('script')[0];
firstScript.parentNode.insertBefore(scriptAPI, firstScript);

// Cria a div invisível onde o vídeo vai rodar
const ytDiv = document.createElement('div');
ytDiv.id = 'youtube-hidden-player';
ytDiv.style.display = 'none'; 
document.body.appendChild(ytDiv);

// Função global obrigatória que o YouTube chama quando estiver pronto
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-hidden-player', {
        height: '0',
        width: '0',
        playerVars: { 
            'autoplay': 0, 
            'controls': 0, 
            'disablekb': 1 
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    ytReady = true;
    ytPlayer.setVolume(25); // Volume baixinho para relaxar sem atrapalhar a voz TTS
    if (musicaPendente || localStorage.getItem('musicaPacienteLumind') !== 'nenhuma') {
        const musicaSalva = localStorage.getItem('musicaPacienteLumind');
        if(musicaSalva && musicaSalva !== 'nenhuma') {
            aplicarMusica(musicaSalva, musicaPendente);
        }
    }
}

// Quando o vídeo acabar, essa função faz ele repetir (Loop infinito)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        ytPlayer.playVideo(); 
    }
}

// 🔥 NOSSOS NOVOS IDs DE VÍDEOS DO YOUTUBE
const trilhasYouTube = {
    lofi: 'AMcVJmb5mvk',     // Novo Lo-Fi escolhido por você
    natureza: 'xMyGzcJVUkA', // Nova Floresta escolhida por você
    chuva: 'mPZkdNFkNps'     // Chuva mantida (Relaxing Rain)
};

const aplicarMusica = (trilha, iniciarTocando = false) => {
    const iconeMusica = document.getElementById('iconeMusica');
    
    // Se a API ainda não carregou, guarda na memória para tocar daqui a pouco
    if (!ytReady) {
        musicaPendente = iniciarTocando;
        return;
    }

    if (trilha === 'nenhuma' || !trilhasYouTube[trilha]) {
        ytPlayer.stopVideo();
        if (iconeMusica) iconeMusica.className = "bi bi-music-note fs-5";
    } else {
        if (iconeMusica) iconeMusica.className = "bi bi-music-note-beamed fs-5 text-primary";
        
        // Puxa o vídeo do YouTube pelo ID
        ytPlayer.loadVideoById(trilhasYouTube[trilha]);
        
        if (!iniciarTocando) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    }
};

// =========================================================
// 2. LÓGICA PRINCIPAL (Cores, Fontes, TTS, etc)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const seletorTema = document.getElementById('seletorTema');
    const btnResetTema = document.getElementById('btnResetTema');
    const btnModoEscuro = document.getElementById('btnModoEscuro');
    const iconeModoEscuro = document.getElementById('iconeModoEscuro');
    const btnVozTema = document.getElementById('btnVozTema');
    const iconeVoz = document.getElementById('iconeVoz');
    const btnAumentar = document.getElementById('btnAumentarFonte');
    const btnDiminuir = document.getElementById('btnDiminuirFonte');
    
    const opcoesCursor = document.querySelectorAll('.cursor-option');
    const opcoesMusica = document.querySelectorAll('.musica-option');
    const iconeMusica = document.getElementById('iconeMusica');

    const COR_PADRAO = '#167ebc';

    let escalaFonteAtual = parseFloat(localStorage.getItem('fontePacienteLumind')) || 1.0;
    let modoEscuroAtivo  = localStorage.getItem('modoEscuroLumind') === 'true';
    let leituraVozAtiva  = localStorage.getItem('leituraVozLumind') === 'true';
    let corSelecionada   = localStorage.getItem('temaPacienteLumind') || COR_PADRAO;
    let cursorSelecionado = localStorage.getItem('cursorPacienteLumind') || 'padrao';
    let musicaSelecionada = localStorage.getItem('musicaPacienteLumind') || 'nenhuma';

    // ── FONTE ──────────────────────────────────────────────
    const aplicarFonte = (escala) => document.documentElement.style.fontSize = (escala * 100) + '%';

    if (btnAumentar) {
        btnAumentar.addEventListener('click', () => {
            if (escalaFonteAtual < 1.4) {
                escalaFonteAtual = Math.round((escalaFonteAtual + 0.1) * 10) / 10;
                aplicarFonte(escalaFonteAtual);
                localStorage.setItem('fontePacienteLumind', escalaFonteAtual);
            }
        });
    }

    if (btnDiminuir) {
        btnDiminuir.addEventListener('click', () => {
            if (escalaFonteAtual > 0.9) {
                escalaFonteAtual = Math.round((escalaFonteAtual - 0.1) * 10) / 10;
                aplicarFonte(escalaFonteAtual);
                localStorage.setItem('fontePacienteLumind', escalaFonteAtual);
            }
        });
    }

    // ── CORES (HEX -> HSL) ──────────────────────────────────
    function hexToHSL(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]); g = parseInt("0x" + hex[2] + hex[2]); b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]); g = parseInt("0x" + hex[3] + hex[4]); b = parseInt("0x" + hex[5] + hex[6]);
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60); if (h < 0) h += 360;
        l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1); return { h, s };
    }

    const aplicarTemaCores = (hex, isDark) => {
        const hsl = hexToHSL(hex);
        const H = hsl.h;
        const S_val = Math.max(hsl.s, 40); 
        const S = S_val + '%';
        const hueRotate = H - 40;
        const saturateLogo = S_val * 2.5; 
        
        const root = document.documentElement;

        if (isDark) {
            root.style.setProperty('--theme-primary', `hsl(${H}, ${S}, 65%)`);
            root.style.setProperty('--theme-dark', `hsl(${H}, ${S}, 90%)`);
            root.style.setProperty('--theme-light', `hsl(${H}, 25%, 15%)`);
            root.style.setProperty('--theme-bg', `hsl(${H}, 20%, 8%)`);
            root.style.setProperty('--theme-hover', `hsl(${H}, 25%, 22%)`);
            root.style.setProperty('--theme-border', `hsl(${H}, 25%, 25%)`);
            root.style.setProperty('--theme-card', `hsl(${H}, 22%, 11%)`);
            root.style.setProperty('--theme-text-btn', `#000000`);
            root.style.setProperty('--logo-filter', `grayscale(1) sepia(1) hue-rotate(${hueRotate}deg) saturate(${saturateLogo}%) brightness(1.8)`);
        } else {
            root.style.setProperty('--theme-primary', `hsl(${H}, ${S}, 45%)`);
            root.style.setProperty('--theme-dark', `hsl(${H}, ${S}, 25%)`);
            root.style.setProperty('--theme-light', `hsl(${H}, ${S}, 94%)`);
            root.style.setProperty('--theme-bg', `hsl(${H}, ${S}, 98%)`);
            root.style.setProperty('--theme-hover', `hsl(${H}, ${S}, 88%)`);
            root.style.setProperty('--theme-border', `hsl(${H}, ${S}, 80%)`);
            root.style.setProperty('--theme-card', `#ffffff`);
            root.style.setProperty('--theme-text-btn', `#ffffff`);
            root.style.setProperty('--logo-filter', `grayscale(1) sepia(1) hue-rotate(${hueRotate}deg) saturate(${saturateLogo}%) brightness(0.8)`);
        }
    };

    if (btnModoEscuro) {
        iconeModoEscuro.className = modoEscuroAtivo ? "bi bi-sun-fill fs-5" : "bi bi-moon-fill fs-5";
        btnModoEscuro.addEventListener('click', () => {
            modoEscuroAtivo = !modoEscuroAtivo;
            localStorage.setItem('modoEscuroLumind', modoEscuroAtivo);
            iconeModoEscuro.className = modoEscuroAtivo ? "bi bi-sun-fill fs-5" : "bi bi-moon-fill fs-5";
            aplicarTemaCores(corSelecionada, modoEscuroAtivo);
        });
    }

    // ── LEITURA POR VOZ ──────────────────────────────────────
    const falarTexto = (texto) => {
        if (!leituraVozAtiva) return;
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    if (btnVozTema) {
        iconeVoz.className = leituraVozAtiva ? "bi bi-volume-up-fill fs-5 text-primary" : "bi bi-volume-mute-fill fs-5";
        btnVozTema.addEventListener('click', () => {
            leituraVozAtiva = !leituraVozAtiva;
            localStorage.setItem('leituraVozLumind', leituraVozAtiva);
            iconeVoz.className = leituraVozAtiva ? "bi bi-volume-up-fill fs-5 text-primary" : "bi bi-volume-mute-fill fs-5";
            if (leituraVozAtiva) falarTexto("Leitura de tela ativada!");
            else window.speechSynthesis.cancel();
        });
    }

    const configurarLeituraDeElementos = () => {
        const elementosSintetizados = document.querySelectorAll('[data-tts]');
        elementosSintetizados.forEach(el => {
            el.addEventListener('mouseenter', () => falarTexto(el.getAttribute('data-tts')));
            el.addEventListener('click', (e) => {
                if(leituraVozAtiva) {
                    e.stopPropagation(); 
                    falarTexto(el.getAttribute('data-tts'));
                }
            });
        });
    };

    // ── CURSOR LÚDICO ────────────────────────────────────────
    const aplicarCursor = (tipo) => {
        document.body.classList.remove('cursor-gigante', 'cursor-patinha', 'cursor-estrela');
        if (tipo !== 'padrao') document.body.classList.add(`cursor-${tipo}`);
    };

    opcoesCursor.forEach(opcao => {
        opcao.addEventListener('click', (e) => {
            e.preventDefault();
            cursorSelecionado = e.currentTarget.getAttribute('data-cursor');
            aplicarCursor(cursorSelecionado);
            localStorage.setItem('cursorPacienteLumind', cursorSelecionado);
        });
    });

    // ── EVENTO DO BOTÃO DE MÚSICA ────────────────────────────
    opcoesMusica.forEach(opcao => {
        opcao.addEventListener('click', (e) => {
            e.preventDefault();
            musicaSelecionada = e.currentTarget.getAttribute('data-musica');
            localStorage.setItem('musicaPacienteLumind', musicaSelecionada);
            musicaPendente = true; // Força tocar quando API carregar
            aplicarMusica(musicaSelecionada, true); 
        });
    });

    // O navegador bloqueia autoplay sem clique. 
    // Então, ao primeiro clique em QUALQUER lugar da página, soltamos o som do YouTube
    document.body.addEventListener('click', () => {
        if (musicaSelecionada !== 'nenhuma' && ytReady) {
            const state = ytPlayer.getPlayerState();
            if (state !== 1) { // 1 = YT.PlayerState.PLAYING
                ytPlayer.playVideo();
            }
        }
    }, { once: true });


    // ── INICIALIZAÇÃO GERAL E RESET ──────────────────────────
    aplicarFonte(escalaFonteAtual);
    aplicarTemaCores(corSelecionada, modoEscuroAtivo);
    aplicarCursor(cursorSelecionado);
    configurarLeituraDeElementos();

    if (seletorTema) {
        seletorTema.value = corSelecionada;
        seletorTema.addEventListener('input', (e) => {
            corSelecionada = e.target.value;
            aplicarTemaCores(corSelecionada, modoEscuroAtivo);
            localStorage.setItem('temaPacienteLumind', corSelecionada); 
        });
    }

    if (btnResetTema) {
        btnResetTema.addEventListener('click', () => {
            window.speechSynthesis.cancel();
            
            localStorage.removeItem('temaPacienteLumind');
            localStorage.removeItem('modoEscuroLumind');
            localStorage.removeItem('fontePacienteLumind');
            localStorage.removeItem('leituraVozLumind');
            localStorage.removeItem('cursorPacienteLumind');
            localStorage.removeItem('musicaPacienteLumind');

            corSelecionada = COR_PADRAO;
            modoEscuroAtivo = false;
            leituraVozAtiva = false;
            escalaFonteAtual = 1.0;
            cursorSelecionado = 'padrao';
            musicaSelecionada = 'nenhuma';

            if(seletorTema) seletorTema.value = COR_PADRAO;
            iconeModoEscuro.className = "bi bi-moon-fill fs-5";
            iconeVoz.className = "bi bi-volume-mute-fill fs-5";
            
            aplicarFonte(escalaFonteAtual);
            aplicarTemaCores(corSelecionada, modoEscuroAtivo);
            aplicarCursor(cursorSelecionado);
            aplicarMusica(musicaSelecionada, false);
        });
    }
});