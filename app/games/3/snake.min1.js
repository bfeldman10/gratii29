
(function(){var canvas=document.getElementById('snakeCanvas'),ctx=canvas.getContext('2d'),score=0,gratii=0,hiScore=0,controlPadHeight=160,input={left:false,right:false,up:false,down:false},splashScreen=true,difficultyLevel=1,touchDevice=false,topUIHeight=35;canvas.width=320;canvas.height=430;window.addEventListener('keyup',function(e){switch(e.keyCode){case 37:input.right=true;break;case 39:input.left=true;break;case 38:input.up=true;break;case 40:input.down=true;break;}},false);function checkButtonRectCollision(clickX,clickY,x1,y1,width,height){var y2=y1+height;var x2=x1+width;if(clickX>x1&&clickX<x2&&clickY>y1&&clickY<y2){return true;}else{return false;}}
var draw={clear:function(){ctx.clearRect(0,0,canvas.width,canvas.height);},line:function(x1,y1,x2,y2,linewidth,col){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.lineWidth=linewidth;ctx.strokeStyle=col;ctx.stroke();},rect:function(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);},circle:function(x,y,radius,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2,true);ctx.closePath();ctx.fill();},circleoutline:function(x,y,radius,col,linewidth){ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2,true);ctx.closePath();ctx.lineWidth=linewidth;ctx.strokeStyle=col;ctx.stroke();},text:function(str,x,y,size,col){ctx.font='bold '+size+'px verdana';ctx.fillStyle=col;ctx.fillText(str,x,y);}};var Snake=function(){this.init=function(){this.dead=false;this.len=0;if(difficultyLevel==1)
this.speed=2;if(difficultyLevel==2)
this.speed=4;if(difficultyLevel==3)
this.speed=6;this.history=[];this.dir=[[0,-1],[1,0],[0,1],[-1,0]];this.x=canvas.width/2;this.y=canvas.height*.9-controlPadHeight;this.w=this.h=16;this.currentDir=0;this.col='darkgreen';};this.move=function(){if(this.dead){return;}
if(input.left){if(this.currentDir!=3)
this.currentDir=1;}else if(input.right){if(this.currentDir!=1)
this.currentDir=3;}else if(input.up){if(this.currentDir!=2)
this.currentDir=0;}else if(input.down){if(this.currentDir!=0)
this.currentDir=2;}
if(this.x<0||this.x>(canvas.width-this.w)||this.y<topui.height||this.y>(canvas.height-controlPadHeight-this.h)){this.dead=true;}
this.x+=(this.dir[this.currentDir][0]*this.speed);this.y+=(this.dir[this.currentDir][1]*this.speed);this.history.push({x:this.x,y:this.y,dir:this.currentDir});};this.draw=function(){var i,offset,segPos,col;for(i=1;i<=this.len;i+=1){offset=i*Math.floor(this.w/this.speed);offset=this.history.length-offset;segPos=this.history[offset];col=this.col;segPos.w=segPos.h=(this.w-this.speed);if(i>2&&i!==this.len&&this.collides(segPos)){this.dead=true;col='darkred';}
draw.rect(segPos.x,segPos.y,this.w,this.h,col);}
draw.rect(this.x,this.y,this.w,this.h,this.col);draw.rect(this.x+4,this.y+1,3,3,'white');draw.rect(this.x+12,this.y+1,3,3,'white');};this.collides=function(obj){this.left=this.x;this.right=this.x+this.w;this.top=this.y;this.bottom=this.y+this.h;obj.left=obj.x;obj.right=obj.x+obj.w;obj.top=obj.y;obj.bottom=obj.y+obj.h;if(this.bottom<obj.top){return false;}
if(this.top>obj.bottom){return false;}
if(this.right<obj.left){return false;}
if(this.left>obj.right){return false;}
return true;};};var Apple=function(){this.x=0;this.y=0;this.w=25;this.h=25;this.replace=0;appleImage=new Image();appleImage.src="snake-images/apple.png";this.draw=function(){if(this.replace===0){this.relocate();}
canvas.getContext("2d").drawImage(appleImage,this.x,this.y);this.replace-=1;};this.relocate=function(){if(score!=0&&score%2!=0){this.x=-50;this.y=-50;}else{this.x=Math.floor(Math.random()*(canvas.width-this.w));this.y=Math.floor(Math.random()*(canvas.height-controlPadHeight-this.h-topui.height)+topui.height);this.replace=Math.floor(Math.random()*200)+200;}};};var topUI=function(){this.init=function(){this.x=0;this.y=0;this.height=36;this.topUIimage=new Image();this.topUIimage.src='snake-images/top-ui.png';}
this.draw=function(){ctx.drawImage(this.topUIimage,this.x,this.y);this.gratiiDistance=270;this.fontSize=18;if(gratii<10){draw.text(gratii,this.gratiiDistance,24,this.fontSize,'#FEFEFE');}else if(gratii>=10&&gratii<100){draw.text(gratii,this.gratiiDistance-10,24,this.fontSize,'#FEFEFE');}else if(gratii>=100&&gratii<1000){draw.text(gratii,this.gratiiDistance-20,24,this.fontSize,'#FEFEFE');}else if(gratii>=1000&&gratii<10000){draw.text(gratii,this.gratiiDistance-30,24,this.fontSize,'#FEFEFE');}else if(gratii>=10000){draw.text(gratii,this.gratiiDistance-40,24,this.fontSize,'#FEFEFE');}};};var topui=new topUI();topui.init();var GratiiCoin=function(){this.x=0;this.y=0;this.w=25;this.h=25;this.replace=0;gratiiImage=new Image();gratiiImage.src="snake-images/gratiicoin25b.png";this.draw=function(){if(this.replace===0){this.relocate();}
canvas.getContext("2d").drawImage(gratiiImage,this.x,this.y);this.replace-=1;};this.relocate=function(){this.relocate=function(){if(score!=0&&score%2==0){this.x=-50;this.y=-50;}else{this.x=Math.floor(Math.random()*(canvas.width-this.w));this.y=Math.floor(Math.random()*(canvas.height-controlPadHeight-this.h-topui.height)+topui.height);this.replace=Math.floor(Math.random()*200)+200;}};};};function loseGame(){if(typeof postScore=='function')
postScore(gratii);console.log(gratii);}
function gameOverScreen(){draw.rect(0,0,canvas.width,canvas.height,"#000000");topui.draw();}
function gameStartScreen(){canvas.getContext("2d").drawImage(backgroundImage,0,0);}
var startTheGame=function(e){if(touchDevice==true){var click={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};}
if(touchDevice==false){var offsets=canvas.getBoundingClientRect();var click={x:e.clientX-offsets.left,y:e.clientY-offsets.top};}
if(click.x<=115){difficultyLevel=1;}else if(click.x>=116&&click.x<=215){difficultyLevel=2;}else if(click.x>=216){difficultyLevel=3;}
document.removeEventListener(startEvent,startTheGame,true);clearInterval(gameStartInterval);splashScreen=false;loopInterval=setInterval(loop,30);p1.init();score=0;return;};function controlPad(){if(p1.currentDir==0)
canvas.getContext("2d").drawImage(controllerUpImage,0,canvas.height-160);if(p1.currentDir==1)
canvas.getContext("2d").drawImage(controllerRightImage,0,canvas.height-160);if(p1.currentDir==2)
canvas.getContext("2d").drawImage(controllerDownImage,0,canvas.height-160);if(p1.currentDir==3)
canvas.getContext("2d").drawImage(controllerLeftImage,0,canvas.height-160);}
var p1=new Snake();p1.init();var apple=new Apple();var coin=new GratiiCoin();function quitGame(){exitGame();}
function loop(){draw.clear();p1.move();p1.draw();topui.draw();if(score==0||score%2==0){apple.draw();}
if(score%2!=0&&score!=0){coin.draw();}
if(p1.collides(apple)){score+=1;p1.len+=1;apple.relocate();coin.relocate();}
if(p1.collides(coin)){score+=1;p1.len+=1;gratii+=1;coin.relocate();apple.relocate();}
if(score>hiScore){hiScore=score;}
controlPad();if(p1.dead===true){setInterval(gameOverScreen,30);clearInterval(loopInterval);loseGame();return;}
input.right=input.left=input.up=input.down=false;};var startEvent='click';try{document.createEvent('TouchEvent');startEvent='touchstart';touchDevice=true;}catch(e){}
if(touchDevice==true){canvas.addEventListener(startEvent,touchHandler,true);function touchHandler(e){var touch={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};moveTheSnake(touch.x,touch.y);}}
if(touchDevice==false){function clickHandler(e){var offsets=canvas.getBoundingClientRect();var click={x:e.clientX-offsets.left,y:e.clientY-offsets.top};moveTheSnake(click.x,click.y);}
canvas.addEventListener('click',clickHandler,true);}
function moveTheSnake(clickX,clickY){if(checkButtonRectCollision(clickX,clickY,0,0,72,topUIHeight)==true){quitGame();}
if(clickX>80&&clickX<135&&clickY>canvas.height-controlPadHeight+50&&clickY<canvas.height-controlPadHeight+105){if(p1.currentDir!=1)
p1.currentDir=3;}else if(clickX>190&&clickX<245&&clickY>canvas.height-controlPadHeight+50&&clickY<canvas.height-controlPadHeight+105){if(p1.currentDir!=3)
p1.currentDir=1;}else if(clickX>135&&clickX<190&&clickY>canvas.height-controlPadHeight&&clickY<canvas.height-controlPadHeight+55){if(p1.currentDir!=2)
p1.currentDir=0;}else if(clickX>135&&clickX<190&&clickY>canvas.height-controlPadHeight+100&&clickY<canvas.height-controlPadHeight+155){if(p1.currentDir!=0)
p1.currentDir=2;}}
window.scrollTo(0,0);controllerImage=new Image();controllerImage.src="snake-images/snakecontrol_up.jpg";controllerUpImage=new Image();controllerUpImage.src="snake-images/snakecontrol_up.jpg";controllerDownImage=new Image();controllerDownImage.src="snake-images/snakecontrol_down.jpg";controllerLeftImage=new Image();controllerLeftImage.src="snake-images/snakecontrol_left.jpg";controllerRightImage=new Image();controllerRightImage.src="snake-images/snakecontrol_right.jpg";backgroundImage=new Image();backgroundImage.src="snake-images/snakeSplashsmall.jpg";document.addEventListener(startEvent,startTheGame,true);var gameStartInterval=setInterval(gameStartScreen,30);var loopInterval;}());