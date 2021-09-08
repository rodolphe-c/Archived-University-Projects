var debugMode = false;

var keyPressed = {};

class Renderer
{
	constructor(w, atlasWorld, atlasCharacter, imgs)
	{
		//World Rendering
		this.world = w;
		this.cnvWorld = document.getElementById('cnvWorld');
		this.ctxWorld = this.cnvWorld.getContext('2d');
		this.texturesWorld = new Array();
		this.imgWorld = imgs[0];
		this.loadedWorld = false;
		this.camera = new Camera(768, 640, this.world.width, this.world.height);

		//Character Rendering
		this.cnvChar = document.getElementById('cnvChar');
		this.ctxChar = this.cnvChar.getContext('2d');
		this.texturesChar = new Array();
		this.char = imgs[1];
		this.loadedChar = true;

		// Animation du joueur
		this.tickPlayer = 0;
		this.frameIndex = 0;

		// GUI Rendering
		this.cnvGUI = document.getElementById('cnvGUI');
		this.ctxGUI = this.cnvWorld.getContext('2d');

		// Mise en place d'une map contenant les regions des textures de tiles
		for (let img of atlasWorld)
		{
			this.texturesWorld[img.attributes.name.value] = {x : Number(img.attributes.x.value),
																				y : Number(img.attributes.y.value),
																				width : Number(img.attributes.width.value),
																				height : Number(img.attributes.height.value)};
		}

		// Mise en place d'une map contenant les regions des textures du personnage
		for (let img of atlasCharacter.player_frames)
		{
			this.texturesChar[img.name] = {x : Number(img.x),
																				y : Number(img.y),
																				width : Number(img.width),
																				height : Number(img.height)};
		}
	}

	// Saisie clavier
	inputs()
	{
		let player = this.world.player;
		let friction  = 0.3;
		let speedIncr = 0.07;

		// Si on appuis sur la touche de sprint Alt
		if (keyPressed[18])
		{
			// Si on appuis sur une touche de déplacement Left, Right, Q ou D
			// On met une plus grande vitesse au joueur en Vx
			if(keyPressed[68] || keyPressed[39])
			{
				player.velocity.x = Math.max(5, player.velocity.x);
				player.velocity.x += speedIncr;
				player.velocity.x = Math.min(10,player.velocity.x)
			}
			else if (keyPressed[81] || keyPressed[37])
			{
				player.velocity.x = Math.min(-5, player.velocity.x);
				player.velocity.x -= speedIncr;
				player.velocity.x = Math.max(-10,player.velocity.x)
			}
		}
		else// Sinon ...
		{
			// on met une vitesse plus faible au joueur en Vx
			if(keyPressed[68] || keyPressed[39])
			{
				player.velocity.x = 5;
			}
			else if (keyPressed[81] || keyPressed[37])
			{
				player.velocity.x = -5;
			}
		}

		// Si on reste immobile et qu'on ne saute pas -> Vx = 0
		if((!keyPressed[68] && !keyPressed[39]) && (!keyPressed[81] && !keyPressed[37]))
		{
			if (!player.is_jumping){
				if(player.velocity.x > 0)
				{
					player.velocity.x = Math.max(0, player.velocity.x - friction);
				}
				else if (player.velocity.x < 0)
				{
					player.velocity.x = Math.min(0, player.velocity.x + friction);
				}
				else
				{
					player.velocity.x = 0;
				}
			}
		}

		// Si on appuis sur une touche de saut Up ou Z
		if(keyPressed[90] || keyPressed[38])
		{
			// On augmente la vitesse en Vy si on ne saute pas déjà
			if(!player.is_jumping)
			{
				player.is_jumping = true;
				player.velocity.y = -10;
			}
		}
	}

	// On dessine la scène
	draw(now, fps)
	{
		this.ctxChar.clearRect(0,0,this.cnvWorld.width,this.cnvWorld.height);
		this.ctxWorld.clearRect(0,0,this.cnvWorld.width,this.cnvWorld.height);
		this.ctxGUI.clearRect(0,0,this.cnvWorld.width,this.cnvWorld.height);

		//Background
		this.ctxWorld.fillStyle = "#4fccd6";
		this.ctxWorld.fillRect(0,0,this.cnvWorld.width,this.cnvWorld.height);

		let player = this.world.player;

		// On met à jour la camera en fonction de la position du joueur
		let posx = Math.min(Math.max(768 - (768 - player.origin.x  + (player.width/2)), 768/2), this.world.width*GLOBAL.BSIZE.x - 768/2);
		let posy = Math.max(Math.min(player.origin.y  + (player.height/2), this.world.height*GLOBAL.BSIZE.y - 640/2 + GLOBAL.BSIZE.y), 640/2);

		this.camera.update(posx,posy);

		// On dessine une couleur de font
		this.ctxWorld.fillRect(0, 0, this.camera.screen.x, this.camera.screen.y);

		// On dessine toutes les tiles visibles par la camera
		for(let y = this.camera.startTile.y; y <= this.camera.endTile.y; ++y)
		{
			for(let x = this.camera.startTile.x; x <= this.camera.endTile.x; ++x)
			{
				if(this.world.matrix[y][x] != undefined)
				{
					let tile = this.world.matrix[y][x];
					let tmp = this.texturesWorld[tile.texture];
					this.ctxWorld.drawImage(
						this.imgWorld,
						tmp.x,
						tmp.y,
						tmp.width,
						tmp.height,
						this.camera.offset.x + (x*GLOBAL.BSIZE.x),
						this.camera.offset.y + (tile.origin.y+GLOBAL.BSIZE.y),
						GLOBAL.BSIZE.x,
						GLOBAL.BSIZE.y);
				}
			}
		}

		// Texture par defaut
		let tmp = this.texturesChar["front"];

		// Texture blessure
		if(player.is_hurt)
		{
			tmp = this.texturesChar["hurt"];
		}
		// Texture de saut
		else if(player.is_jumping)
		{
			tmp = this.texturesChar["jump"];
		}
		// Texture de marche
		else if (player.velocity.x != 0)
		{
			this.tickPlayer +=1;

			let framelimit = 3
			if(keyPressed[18]) // Si on sprint on augmente la vitesse d'animation
			{
				framelimit = 1;
			}
			// On incrémente l'indice de la frame
			if(this.tickPlayer >= framelimit)
			{
				this.frameIndex = (this.frameIndex+1)%11
				this.tickPlayer = 0;
			}
			tmp = this.texturesChar["walk"+ this.frameIndex.toString()];
		}
		else
		{
			this.tickPlayer = 0;
		}

		// http://stackoverflow.com/questions/35973441/how-to-horizontally-flip-an-image
		if(player.velocity.x < 0) // On inverse l'image
		{
			this.ctxChar.translate(this.camera.offset.x + player.origin.x + GLOBAL.BSIZE.x,this.camera.offset.y + (player.origin.y+GLOBAL.BSIZE.y));
			this.ctxChar.scale(-1,1);
			this.ctxChar.drawImage(
				this.char,
				tmp.x,
				tmp.y,
				tmp.width,
				tmp.height,
				0,
				0,
				GLOBAL.BSIZE.x,
				GLOBAL.BSIZE.y);
			this.ctxChar.setTransform(1,0,0,1,0,0);
		}
		else
		{
			this.ctxChar.drawImage(
				this.char,
				tmp.x,
				tmp.y,
				tmp.width,
				tmp.height,
				this.camera.offset.x + player.origin.x,
				this.camera.offset.y + (player.origin.y+GLOBAL.BSIZE.y),
				GLOBAL.BSIZE.x,
				GLOBAL.BSIZE.y);
		}

		//GUI
		this.ctxGUI.font = "20px Arial";
		this.ctxGUI.fillStyle = "white";
		this.ctxGUI.textAlign = "center";
		this.ctxGUI.fillText("FPS : " + fps.toString(),720,50);

		this.ctxGUI.font = "30px Arial";
		this.ctxGUI.fillStyle = "red";
		this.ctxGUI.textAlign = "center";
		this.ctxGUI.fillText("Life : " + player.life.toString(),50,50);

		this.ctxGUI.font = "15px Arial";
		this.ctxGUI.fillStyle = "white";
		this.ctxGUI.textAlign = "center";
		this.ctxGUI.fillText("Left = Q or Left, Right = D or Right, Jump = Z or Jump, Sprint = Alt pressed",768/2,620);
	}

	// Lancement du jeu
	start ()
	{
		let that = this;
		document.addEventListener('keydown', e => {keyPressed[e.keyCode] = true;});
		document.addEventListener('keyup', e => {keyPressed[e.keyCode] = false;});

		let lastCalledTime = 0;
		let lastPrintFPS = 1;
		let fps = 60;

		let lastGameOver = 0;

		let buttonPressed = false;

		// Gameloop
		function gameloop(now)
		{
			// Calcul des FPS
			let delta = (new Date().getTime() - lastCalledTime) / 1000;
			lastCalledTime = new Date().getTime();
			lastPrintFPS += delta;

			// On test si le joueur a perdu
			if(that.world.player.life <= 0)
			{
				lastGameOver += delta;
				that.ctxGUI.font = "60px Arial";
				that.ctxGUI.fillStyle = "red";
				that.ctxGUI.textAlign = "center";
				that.ctxGUI.fillText("GAME OVER !",768/2,640/2);
				if(lastGameOver >= 3) // On reset au bout de 3 secondes
				{
					lastGameOver = 0;
					that.world.currentLvlIndex -= 1;
					that.world.loadNextLvl();
				}
				requestAnimationFrame(gameloop);
			}
			// Sinon ...
			else
			{
				// Mise à jour des FPS après chaque seconde
				if(lastPrintFPS >= 1)
				{
					lastPrintFPS = 0;
					fps = Math.ceil((1/delta));
				}
				// Si le niveau actuel est terminé ...
				if(that.world.step(delta))
				{
					// S'il n'y a pas d'autres niveaux
					if(!that.world.loadNextLvl())
					{
						that.ctxGUI.font = "60px Arial";
						that.ctxGUI.fillStyle = "red";
						that.ctxGUI.textAlign = "center";
						that.ctxGUI.fillText("VICTORY !",768/2,640/2);
					}
					else
					{
						that.camera = new Camera(768, 640, that.world.width, that.world.height);
						requestAnimationFrame(gameloop);
					}
				}
				else
				{
					that.inputs();
					that.draw(now, fps);
					requestAnimationFrame(gameloop);
				}
			}
		};

		function mainMenu(now)
		{

			if(keyPressed[13])
			{
				requestAnimationFrame(gameloop);
			}
			else
			{
				that.ctxWorld.fillStyle = "#4fccd6";
				that.ctxWorld.fillRect(0,0,that.cnvWorld.width,that.cnvWorld.height);

				that.ctxGUI.font = "60px Arial";
				that.ctxGUI.fillStyle = "red";
				that.ctxGUI.textAlign = "center";
				that.ctxGUI.fillText("Incredible Platformer !",768/2,640/2 - 60);

				that.ctxGUI.font = "40px Arial";
				that.ctxGUI.fillStyle = "white";
				that.ctxGUI.textAlign = "center";
				that.ctxGUI.fillText("Press Enter to start",768/2,640/2);

				// Texture par defaut
				let tmp = that.texturesChar["stand"];
				that.ctxChar.drawImage(
					that.char,
					tmp.x,
					tmp.y,
					tmp.width,
					tmp.height,
					768/2 - tmp.width,
					500 - tmp.height,
					tmp.width*2,
					tmp.height*2);

				tmp = that.texturesWorld["grass"];
				that.ctxChar.drawImage(
					that.imgWorld,
					tmp.x,
					tmp.y,
					tmp.width,
					tmp.height,
					768/2 - tmp.width,
					500 + 90,
					tmp.width*2,
					tmp.height*2);
				requestAnimationFrame(mainMenu);
			}
		};

		requestAnimationFrame(mainMenu);
	}
};
