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

let player = {};
let energia = 0;
let meditando = false;
let cooldownMeditacao = false;
let cooldownTreino = false;

function gerarSprite(seed) {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
}

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
  };
  spriteJogador.src = gerarSprite(player.nome + player.classe);
  titulo.textContent = `${player.nome} - ${player.classe}`;
  atualizarStatus();
  menu.style.display = 'none';
  jogo.style.display = 'flex';
});

function atualizarStatus() {
  statusDiv.innerHTML = `HP: ${player.hp} | Dano: ${player.dano} | Def: ${player.def} | Nível: ${player.nivel} | XP: ${player.xp}`;
  energiaDiv.textContent = `Energia natural: ${energia}`;
}

meditarBtn.addEventListener('click', () => {
  if (cooldownMeditacao) return;
  meditando = true;
  cooldownMeditacao = true;
  let tempo = 30;
  energiaDiv.textContent = `Meditando... ${tempo}s`;

  const intervalo = setInterval(() => {
    tempo--;
    energia++;
    energiaDiv.textContent = `Meditando... ${tempo}s | Energia: ${energia}`;
    if (tempo <= 0) {
      clearInterval(intervalo);
      meditando = false;
      energiaDiv.textContent = `Meditação concluída! Energia total: ${energia}`;
      setTimeout(() => {
        cooldownMeditacao = false;
        energiaDiv.textContent = 'Meditação pronta novamente.';
      }, 90000);
    }
  }, 1000);
});

treinarBtn.addEventListener('click', () => {
  if (cooldownTreino) return;
  cooldownTreino = true;
  player.dano += 2;
  player.def += 1;
  atualizarStatus();
  energiaDiv.textContent = 'Treinando... Dano e defesa aumentados!';
  setTimeout(() => {
    cooldownTreino = false;
    energiaDiv.textContent = 'Treino disponível novamente.';
  }, 10000);
});
