const menu = document.getElementById('menu');
const jogo = document.getElementById('jogo');
const iniciar = document.getElementById('iniciar');
const classeSel = document.getElementById('classe');
const nomeSel = document.getElementById('nome');
const titulo = document.getElementById('titulo');
const spriteJogador = document.getElementById('spriteJogador');
const statusDiv = document.getElementById('status');
const meditarBtn = document.getElementById('meditar');
const treinarBtn = document.getElementById('treinar');
const batalhaDiv = document.getElementById('batalha');
const energiaDiv = document.getElementById('energia');
const descerBtn = document.getElementById('descer');

let player = {};
let energia = 0;
let meditando = false;
let cooldownMeditacao = false;
let cooldownTreino = false;

// Sprites
function gerarSprite(seed) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
}
function gerarSpriteInimigo(seed) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
}

// Iniciar jogo
iniciar.addEventListener('click', () => {
  if (!nomeSel.value) return alert('Digite um nome!');
  player = {
    nome: nomeSel.value,
    classe: classeSel.value,
    hp: 100,
    dano: 10,
    def: 5,
    nivel: 1,
    xp: 0,
    itens: { pocao: 2 }
  };
  spriteJogador.src = gerarSprite(player.nome + player.classe);
  titulo.textContent = `${player.nome} - ${player.classe}`;
  atualizarStatus();
  menu.style.display = 'none';
  jogo.style.display = 'flex';
});

// Atualiza status e barra de HP
function atualizarStatus() {
  const hpPercent = Math.max(player.hp, 0);
  statusDiv.innerHTML = `
    <p>HP: ${hpPercent} | Dano: ${player.dano} | Def: ${player.def} | Nível: ${player.nivel} | XP: ${player.xp}</p>
    <p>Itens: Poções ${player.itens.pocao}</p>
    <div id="barraJogador"><div style="width:${hpPercent}%"></div></div>
  `;
  energiaDiv.innerHTML = `Energia natural: ${energia} ${meditando ? '<span class="energiaAnimada"></span><span class="energiaAnimada"></span>' : ''}`;
}

// Meditar com animação e vibração
meditarBtn.addEventListener('click', () => {
  if (cooldownMeditacao) return;
  meditando = true;
  cooldownMeditacao = true;
  let tempo = 30;
  energiaDiv.innerHTML = `Meditando... ${tempo}s <span class="energiaAnimada"></span>`;
  if (navigator.vibrate) navigator.vibrate(50);

  const intervalo = setInterval(() => {
    tempo--;
    energia++;
    energiaDiv.innerHTML = `Meditando... ${tempo}s | Energia: ${energia} <span class="energiaAnimada"></span>`;
    if (tempo <= 0) {
      clearInterval(intervalo);
      meditando = false;
      energiaDiv.innerHTML = `Meditação concluída! Energia total: ${energia}`;
      setTimeout(() => {
        cooldownMeditacao = false;
        energiaDiv.innerHTML = 'Meditação pronta novamente.';
      }, 90000); // cooldown 90s
    }
  }, 1000);
});

// Treinar com animação e vibração
treinarBtn.addEventListener('click', () => {
  if (cooldownTreino) return;
  cooldownTreino = true;
  player.dano += 2;
  player.def += 1;
  atualizarStatus();
  energiaDiv.textContent = 'Treinando... Dano e defesa aumentados!';
  if (navigator.vibrate) navigator.vibrate(50);
  setTimeout(() => {
    cooldownTreino = false;
    energiaDiv.textContent = 'Treino disponível novamente.';
  }, 10000); // cooldown 10s
});

// Gerar inimigos
function gerarInimigo(nivel) {
  const inimigos = [
    { nome: 'Goblin', hp: 30, dano: 5, def: 2 },
    { nome: 'Esqueleto', hp: 40, dano: 6, def: 3 },
    { nome: 'Lobo', hp: 50, dano: 7, def: 4 },
    { nome: 'Morcego Gigante', hp: 35, dano: 8, def: 2 }
  ];
  const inimigo = { ...inimigos[Math.floor(Math.random() * inimigos.length)] };
  inimigo.hp += nivel * 5;
  inimigo.dano += nivel * 1;
  inimigo.def += Math.floor(nivel / 2);
  inimigo.sprite = gerarSpriteInimigo(inimigo.nome);
  return inimigo;
}

// Botão Descer na Masmorra
descerBtn.addEventListener('click', () => {
  const inimigo = gerarInimigo(player.nivel);
  batalhaDiv.innerHTML = `
    <h3>Você encontrou um ${inimigo.nome}!</h3>
    <img src="${inimigo.sprite}" class="sprite" alt="${inimigo.nome}">
    <div id="barraInimigo"><div style="width:${inimigo.hp}%"></div></div>
    <button id="atacar">Atacar</button>
    <button id="habilidade">Habilidade</button>
    <button id="item">Usar Item</button>
    <button id="fugir">Fugir</button>
  `;

  const barraInimigo = document.getElementById('barraInimigo');

  function atualizarBarraInimigo() {
    const hpPercent = Math.max(inimigo.hp, 0);
    barraInimigo.querySelector('div').style.width = `${hpPercent}%`;
  }

  function verificarFimBatalha() {
    if (inimigo.hp <= 0) {
      batalhaDiv.innerHTML = `<p>${inimigo.nome} derrotado! Você ganhou 10 XP.</p>`;
      player.xp += 10;
      player.nivel = Math.floor(player.xp / 50) + 1;
      atualizarStatus();
      return true;
    }
    if (player.hp <= 0) {
      batalhaDiv.innerHTML = `<p>Você foi derrotado pelo ${inimigo.nome}...</p>`;
      return true;
    }
    return false;
  }

  // Atacar
  document.getElementById('atacar').addEventListener('click', () => {
    const danoCausado = Math.max(player.dano - inimigo.def, 1);
    inimigo.hp -= danoCausado;
    atualizarBarraInimigo();

    // Animação inimigo
    const imgInimigo = batalhaDiv.querySelector('img');
    imgInimigo.classList.add('atacado');
    setTimeout(() => imgInimigo.classList.remove('atacado'), 300);

    let msg = `Você causou ${danoCausado} de dano ao ${inimigo.nome}.<br>`;
    if (!verificarFimBatalha()) {
      const danoRecebido = Math.max(inimigo.dano - player.def, 1);
      player.hp -= danoRecebido;
      atualizarStatus();
      msg += `${inimigo.nome} atacou você e causou ${danoRecebido} de dano.`;
      verificarFimBatalha();
    }
    batalhaDiv.innerHTML += `<p>${msg}</p>`;
  });

  // Habilidade
  document.getElementById('habilidade').addEventListener('click', () => {
    if (energia >= 5) {
      const danoEspecial = player.dano * 2;
      inimigo.hp -= danoEspecial;
      energia -= 5;
      atualizarBarraInimigo();
      batalhaDiv.innerHTML += `<p>Você usou habilidade especial e causou ${danoEspecial} de dano!</p>`;
      if (!verificarFimBatalha()) {
        const danoRecebido = Math.max(inimigo.dano - player.def, 1);
        player.hp -= danoRecebido;
        atualizarStatus();
      }
    } else {
      batalhaDiv.innerHTML += `<p>Energia insuficiente para habilidade!</p>`;
    }
  });

  // Item
  document.getElementById('item').addEventListener('click', () => {
    if (player.itens.pocao > 0) {
      player.hp += 30;
      player.itens.pocao--;
      atualizarStatus();
      batalhaDiv.innerHTML += `<p>Você usou uma poção e recuperou 30 HP!</p>`;
    } else {
      batalhaDiv.innerHTML += `<p>Você não tem poções!</p>`;
    }
  });

  // Fugir
  document.getElementById('fugir').addEventListener('click', () => {
    batalhaDiv.innerHTML += `<p>Você fugiu do ${inimigo.nome}!</p>`;
  });
});
