let tamanhoTabuleiro;
let quadrado;
let jogoIniciado = false;

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let menu = document.querySelector('#menu');
let canvasDiv = document.querySelector('.canvas-div');

let escala = .6;//Quanto o simbolo vai ocupar do quadrado
let tabuleiro = [
   [0,0,0],
   [0,0,0],
   [0,0,0],
];
//jogador 1: X
//jogador -1: O
let jogador = 1;
let vencedor = null;
let ia = 0;

window.addEventListener('resize', () => {
   resizeCanvas();
   desenhaJogadas();
   vencedor = checaVencedor(true);
});
canvas.addEventListener('mousedown', e => cliqueMouse(e));

let resizeCanvas = () => {
   tamanhoTabuleiro = Math.min(document.documentElement.clientWidth,document.documentElement.clientHeight);
   canvasDiv.setAttribute("style",
      "width:" + tamanhoTabuleiro + 'px;' +
      "height:" + tamanhoTabuleiro + 'px;' +
      "font-size:" + tamanhoTabuleiro/25 + 'px'
   );
   ctx.canvas.height = tamanhoTabuleiro;
   ctx.canvas.width = tamanhoTabuleiro;
   quadrado = tamanhoTabuleiro / 3;
   ctx.lineWidth = quadrado / 20;
   desenhaTabuleiro();
   if(jogoIniciado){
      menu.setAttribute("style", "display: none;");
   } else {
      menu.setAttribute("style", "display: flex;");
   }
}

let cliqueMouse = e => {
   //console.log(vencedor);
   if(jogoIniciado){
      if(vencedor != null){
         //reinicia jogo
         jogador = 1;
         vencedor = null;
         tabuleiro = [
            [0,0,0],
            [0,0,0],
            [0,0,0],
         ];
         resizeCanvas();
         if(ia == 1) escolheJogada();
         return;
      }

      let pos = posicaoCursor(e);
      if(tabuleiro[pos.i][pos.j]==0){
         if(jogador == 1){
            tabuleiro[pos.i][pos.j] = 1;
            desenhaX(pos.i,pos.j);
            jogador = -1;
         } else {
            tabuleiro[pos.i][pos.j] = -1;
            desenhaO(pos.i,pos.j);
            jogador = 1;
         }
      }
      vencedor = checaVencedor(true);
      if(vencedor == null){
         if(ia == jogador){
            escolheJogada();
         }
      }
   }
}

let posicaoCursor = (e) => {
   i = Math.floor(e.offsetX / quadrado);
   j = Math.floor(e.offsetY / quadrado);
   return {i:i,j:j};
}

let checaVencedor = final => {
   // console.log("-----");
   // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
   // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
   // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
   let vencedor = null;
   let somaLinha = 0;
   for(let i = 0; i < 3; i++){
      let linha = tabuleiro[0][i] + tabuleiro[1][i] + tabuleiro[2][i];
      if(linha == -3 || linha == 3){
         vencedor = tabuleiro[0][i];
         if(final) desenhaLinha(i);
      }
      let coluna = tabuleiro[i][0] + tabuleiro[i][1] + tabuleiro[i][2];
      if(coluna == -3 || coluna == 3){
         vencedor = tabuleiro[i][0];
         if(final) desenhaColuna(i);
      }
      somaLinha += Math.abs(tabuleiro[0][i]) + Math.abs(tabuleiro[1][i]) + Math.abs(tabuleiro[2][i]);
   }
   let diagonalPrincipal = tabuleiro[0][0] + tabuleiro[1][1] + tabuleiro[2][2];
   if(diagonalPrincipal == -3 || diagonalPrincipal == 3){
      vencedor = tabuleiro[0][0];
      if(final) desenhaDiagonalPrincipal();
   }
   let diagonalSecundaria = tabuleiro[0][2] + tabuleiro[1][1] + tabuleiro[2][0];
   if(diagonalSecundaria == -3 || diagonalSecundaria == 3){
      vencedor = tabuleiro[0][2];
      if(final) desenhaDiagonalSecundaria();
   }
   if(vencedor == null && somaLinha == 9) vencedor = 0;
   return vencedor;
}

let escolheJogada = () => {
   let melhorPonto = -Infinity;
   let jogada;
   for(let i=0; i<3; i++){
      for(let j=0; j<3; j++){
         if(tabuleiro[i][j] == 0){
            tabuleiro[i][j] = ia;
            let ponto = minimax(tabuleiro, 0, false);
            //console.log(i,j,ponto);
            tabuleiro[i][j] = 0;
            if(ponto > melhorPonto){
               melhorPonto = ponto;
               jogada = {i:i,j:j};
            }
         }
      }
   }
   tabuleiro[jogada.i][jogada.j] = ia;
   
   if(ia>0){
      desenhaX(jogada.i,jogada.j);
   } else {
      desenhaO(jogada.i,jogada.j);
   }
   jogador = -ia;
   vencedor = checaVencedor(true);
}

let minimax = (tabuleiro, profundidade, maximiza) => {
   let resultado = checaVencedor(false);
   if(resultado !== null) {
      if(resultado == 0) return 0;
      if(resultado == ia){
         return 10;
      } else {
         return -10;
      }
   }
   if(maximiza){
      let melhorPonto = -Infinity;
      for(let i=0; i<3; i++){
         for(let j=0; j<3; j++){
            if(tabuleiro[i][j] == 0){
               tabuleiro[i][j] = ia;
               let ponto = minimax(tabuleiro, profundidade + 1, false) - profundidade;
               // console.log("max");
               // console.log("-----");
               // console.log(tabuleiro[0][0], tabuleiro[1][0], tabuleiro[2][0]);
               // console.log(tabuleiro[0][1], tabuleiro[1][1], tabuleiro[2][1]);
               // console.log(tabuleiro[0][2], tabuleiro[1][2], tabuleiro[2][2]);
               // console.log(ponto);
               tabuleiro[i][j] = 0;
               melhorPonto = Math.max(ponto, melhorPonto);
            }
         }
      }
      return melhorPonto;   
   } else {
      let melhorPonto = Infinity;
      for(let i=0; i<3; i++){
         for(let j=0; j<3; j++){
            if(tabuleiro[i][j] == 0){
               tabuleiro[i][j] = -ia;
               let ponto = minimax(tabuleiro, profundidade + 1, true) + profundidade;
               // console.log("min");8wn 
               tabuleiro[i][j] = 0;
               melhorPonto = Math.min(ponto, melhorPonto);
            }
         }
      }
      return melhorPonto;
   }
}

//Opções do menu principal
let doisJogadores = () => {
   jogoIniciado = true;
   resizeCanvas();
}

let jogadorX = () => {
   jogoIniciado = true;
   ia = -1;
   resizeCanvas();
}

let jogadorO = () => {
   jogoIniciado = true;
   ia = 1;
   resizeCanvas();
   escolheJogada();
}

let desenhaTabuleiro = () => {
   ctx.beginPath();
   ctx.strokeStyle = "#000000";
   ctx.moveTo(quadrado,0);
   ctx.lineTo(quadrado,tamanhoTabuleiro);
   ctx.moveTo(2*quadrado,0);
   ctx.lineTo(2*quadrado,tamanhoTabuleiro);
   ctx.moveTo(0,quadrado);
   ctx.lineTo(tamanhoTabuleiro,quadrado);
   ctx.moveTo(0,2*quadrado);
   ctx.lineTo(tamanhoTabuleiro,2*quadrado);
   ctx.stroke();
}

let desenhaJogadas = () => {
   for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
         if(tabuleiro[i][j] == 1) desenhaX(i,j);
         if(tabuleiro[i][j] == -1) desenhaO(i,j);
      }
   }
}

let desenhaX = (i,j) => {
   let cantoX = i * quadrado;
   let cantoY = j * quadrado;
   let margem = (quadrado - quadrado * escala) / 2;
   ctx.beginPath();
   ctx.strokeStyle = "#000000";
   ctx.moveTo(cantoX + margem, cantoY + margem);
   ctx.lineTo(cantoX + margem + quadrado * escala, cantoY + margem + quadrado * escala);
   ctx.moveTo(cantoX + margem + quadrado * escala, cantoY + margem);
   ctx.lineTo(cantoX + margem, cantoY + margem + quadrado * escala);
   ctx.stroke();
}

let desenhaO = (i,j) => {
   let cantoX = i * quadrado;
   let cantoY = j * quadrado;
   ctx.beginPath();
   ctx.strokeStyle = "#000000";
   ctx.ellipse(cantoX + quadrado / 2, cantoY + quadrado / 2, quadrado * escala / 2, quadrado * escala / 2,0,0,2*Math.PI);
   ctx.stroke();
}

//Desenha linhas vencedoras
let desenhaLinha = i => {
   ctx.beginPath();
   ctx.strokeStyle = "#ff0000";
   ctx.moveTo(0, i * quadrado + quadrado / 2);
   ctx.lineTo(tamanhoTabuleiro, i * quadrado + quadrado / 2);
   ctx.stroke();
}
let desenhaColuna = i => {
   ctx.beginPath();
   ctx.strokeStyle = "#ff0000";
   ctx.moveTo(i * quadrado + quadrado / 2, 0);
   ctx.lineTo(i * quadrado + quadrado / 2, tamanhoTabuleiro);
   ctx.stroke();
}
let desenhaDiagonalPrincipal = () => {
   ctx.beginPath();
   ctx.strokeStyle = "#ff0000";
   ctx.moveTo(0, 0);
   ctx.lineTo(tamanhoTabuleiro, tamanhoTabuleiro);
   ctx.stroke();
}
let desenhaDiagonalSecundaria = () => {
   ctx.beginPath();
   ctx.strokeStyle = "#ff0000";
   ctx.moveTo(0, tamanhoTabuleiro);
   ctx.lineTo(tamanhoTabuleiro, 0);
   ctx.stroke();
}


//Inicializa jogo
resizeCanvas();


