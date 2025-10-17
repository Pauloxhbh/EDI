// Elementos
const spriteJogador = document.getElementById('spriteJogador');
const statusDiv = document.getElementById('status');
const energiaDiv = document.getElementById('energia');
const descerBtn = document.getElementById('descer');
const batalhaDiv = document.getElementById('batalha');
const andarSpan = document.getElementById('andarAtual');

let player = {}, energia = 0, meditando = false, cooldownMeditacao = false, cooldownTreino = false, andarAtual = 1;

// Sprites das classes
const sprites = {
  guerreiro: { idle:'sprites/guerreiro_idle.png', ataque:'sprites/guerreiro_ataque.png', dano:'sprites/guerreiro_dano.png', meditar:'sprites/guerreiro_meditar.png' },
  domador: { idle:'sprites/domador_idle.png', ataque:'sprites/domador_ataque.png', dano:'sprites/domador_dano.png', meditar:'sprites/domador_meditar.png' },
  necromante: { idle:'sprites/necromante_idle.png', ataque:'sprites/necromante_ataque.png', dano:'sprites/necromante_dano.png', meditar:'sprites/necromante_meditar.png' },
  buda: { idle:'sprites/buda_idle.png', ataque:'sprites/buda_ataque.png', dano:'sprites/buda_dano.png', meditar:'sprites/buda_meditar.png' },
  dragao: { idle:'sprites/dragao_idle.png', ataque:'sprites/dragao_ataque.png', dano:'sprites/dragao_dano.png', meditar:'sprites/dragao_meditar.png' }
};

// Gerar inimigos
function gerarInimigo(){
  let inimigo;
  if(andarAtual % 5 === 0){ // Chefe
    inimigo = {
      nome: `Chefe do Andar ${andarAtual}`,
      hp: 150 + andarAtual*10,
      dano: 20 + andarAtual*2,
      def: 10 + Math.floor(andarAtual/2),
      sprite: 'sprites/chefe.png',
      drop: 'poção'
    };
  } else { // Inimigos normais
    const inimigosBase = [
      {nome:'Goblin',hp:30,dano:5,def:2,sprite:'sprites/goblin.png'},
      {nome:'Esqueleto',hp:40,dano:6,def:3,sprite:'sprites/esqueleto.png'},
      {nome:'Lobo',hp:50,dano:7,def:4,sprite:'sprites/lobo.png'},
      {nome:'Morcego Gigante',hp:35,dano:8,def:2,sprite:'sprites/morcego.png'}
    ];
    inimigo = {...inimigosBase[Math.floor(Math.random()*inimigosBase.length)]};
    // Escalar com andar
    inimigo.hp += andarAtual * 5;
    inimigo.dano += Math.floor(andarAtual * 1.2);
    inimigo.def += Math.floor(andarAtual/2);
    inimigo.drop = 'poção';
  }
  return inimigo;
}

// Atualizar status
function atualizarStatus(){
  const hpPercent = Math.max(player.hp,0);
  statusDiv.innerHTML = `
    <p>HP: ${hpPercent} | Dano: ${player.dano} | Def: ${player.def} | Nível: ${player.nivel} | XP: ${player.xp}</p>
    <p>Itens: Poções ${player.itens.pocao}</p>
    <div id="barraJogador"><div style="width:${hpPercent}%"></div></div>
  `;
  energiaDiv.innerHTML = `Energia natural: ${energia} ${meditando ? '<span class="energiaAnimada"></span><span class="energiaAnimada"></span>' : ''}`;
  andarSpan.textContent = andarAtual;
}

// Mostrar mensagem na batalha
function mostrarMensagem(msg){
  batalhaDiv.innerHTML += `<p>${msg}</p>`;
  batalhaDiv.scrollTop = batalhaDiv.scrollHeight;
}

// Função de batalha
descerBtn.addEventListener('click', ()=>{
  andarAtual++;
  const inimigo = gerarInimigo();
  batalhaDiv.innerHTML = `
    <h3>Andar ${andarAtual} - ${inimigo.nome} aparece!</h3>
    <div class="card">
      <img src="${inimigo.sprite}" class="sprite" alt="${inimigo.nome}">
      <div id="barraInimigo"><div style="width:${inimigo.hp}%"></div></div>
      <button id="atacar">Atacar</button>
      <button id="habilidade">Habilidade</button>
      <button id="item">Usar Item</button>
      <button id="fugir">Fugir</button>
    </div>
  `;

  const barraInimigo = document.querySelector('#barraInimigo div');
  let batalhaAtiva = true;

  function fimBatalha(vitoria){
    batalhaAtiva=false;
    if(vitoria){
      player.xp += andarAtual*5;
      player.nivel = Math.floor(player.xp/50)+1;
      // Drop
      if(inimigo.drop === 'poção'){
        player.itens.pocao++;
        mostrarMensagem(`${inimigo.nome} dropou 1 poção!`);
      }
      mostrarMensagem(`${inimigo.nome} derrotado! Você ganhou ${andarAtual*5} XP.`);
      atualizarStatus();
    } else {
      mostrarMensagem(`Você foi derrotado pelo ${inimigo.nome}...`);
    }
  }

  function turnoJogador(acao){
    if(!batalhaAtiva) return;

    if(acao==='atacar'){
      spriteJogador.src = sprites[player.classe].ataque;
      setTimeout(()=>spriteJogador.src=sprites[player.classe].idle,300);
      const dano = Math.max(player.dano - inimigo.def,1);
      inimigo.hp -= dano;
      barraInimigo.style.width = Math.max(inimigo.hp,0)+'%';
      mostrarMensagem(`Você causou ${dano} de dano ao ${inimigo.nome}`);
    } else if(acao==='habilidade'){
      if(energia >= 5){
        spriteJogador.src = sprites[player.classe].ataque;
        setTimeout(()=>spriteJogador.src=sprites[player.classe].idle,300);
        const dano = player.dano*2;
        inimigo.hp -= dano;
        energia -= 5;
        barraInimigo.style.width = Math.max(inimigo.hp,0)+'%';
        mostrarMensagem(`Habilidade usada! ${dano} de dano ao ${inimigo.nome}`);
      } else mostrarMensagem('Energia insuficiente!');
    } else if(acao==='item'){
      if(player.itens.pocao>0){
        player.hp += 30; player.itens.pocao--;
        atualizarStatus();
        mostrarMensagem('Você usou uma poção e recuperou 30 HP!');
      } else mostrarMensagem('Sem poções!');
    } else if(acao==='fugir'){
      mostrarMensagem(`Você fugiu do ${inimigo.nome}!`);
      return fimBatalha(false);
    }

    if(inimigo.hp<=0) return fimBatalha(true);

    // Turno inimigo
    setTimeout(()=>{
      if(!batalhaAtiva) return;
      const danoRecebido = Math.max(inimigo.dano - player.def,1);
      player.hp -= danoRecebido;
      atualizarStatus();
      mostrarMensagem(`${inimigo.nome} atacou você e causou ${danoRecebido} de dano`);
      if(player.hp<=0) fimBatalha(false);
    },500);
  }

  document.getElementById('atacar').onclick = ()=>turnoJogador('atacar');
  document.getElementById('habilidade').onclick = ()=>turnoJogador('habilidade');
  document.getElementById('item').onclick = ()=>turnoJogador('item');
  document.getElementById('fugir').onclick = ()=>turnoJogador('fugir');
});

// Atualiza status inicial
function iniciarJogo(){
  player={nome:'Herói',classe:'guerreiro',hp:100,dano:10,def:5,nivel:1,xp:0,itens:{pocao:2}};
  spriteJogador.src=sprites[player.classe].idle;
  atualizarStatus();
}

iniciarJogo();
