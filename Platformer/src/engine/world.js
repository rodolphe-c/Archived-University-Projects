class World
{
	constructor(jsonFileList)
	{
		this.game_over = false;
		this.lvls = jsonFileList;
		this.currentLvlIndex = -1;
		this.height = 0;
		this.width = 0;
		this.loaded = false;
		this.loadNextLvl();

		this.lastHit = 1;
	}

	// Chargement du niveau suivant
	loadNextLvl()
	{
		this.currentLvlIndex+=1;

		// On retourne false s'il n'y a plus de niveaux
		if(this.currentLvlIndex >= this.lvls.length) {return false;}

		this.matrix = [];

		// On initialise le niveau actuel
		let currentLvl = this.lvls[this.currentLvlIndex];
		this.height = currentLvl.world.height;
		this.width = currentLvl.world.width;

		this.spawn = new Vector(0,0);
		this.player = new Character(this.spawn);
		this.exit = {"x": 0, "y" : 0};

		let cases = currentLvl.cases;

		// On teste qu'on a bien le bon nombre de lignes
		if(currentLvl.world.matrix.length != this.height)
		{
			throw new String("/!\\ Niveau mal formaté : nombre de ligne incorrect");
		}
		else
		{
			// On remplis notre matrice représentant le niveau
			for (let i = 0; i < this.height; i++) // Pour chaque ligne
			{
				this.matrix[i] = [];
				// On teste que la ligne fait la bonne taille
				if (currentLvl.world.matrix[i].length != this.width)
				{
					throw new String("/!\\ Niveau mal formaté :  Taille de la Ligne " + i.toString() + " != " + this.width.toString());
				}
				for (let j = 0; j < this.width; j++) // Pour chaque cases
				{
					if(currentLvl.world.matrix[i][j] == 'X') // S'il s'agit du joueur
					{
						this.spawn = new Vector(j*GLOBAL.BSIZE.x,i*GLOBAL.BSIZE.y);
						this.player = new Character(this.spawn);
					}
					else if(currentLvl.world.matrix[i][j] == '@') // S'il s'agit de la fin du niveau
					{
						this.matrix[i][j] = new Tile(new Vector(j*GLOBAL.BSIZE.x, i*GLOBAL.BSIZE.y), "signExit", true);
						this.exit =  {"x": j, "y" : i};
					}
					else if(currentLvl.world.matrix[i][j] != ' ') // Si ça n'ai pas un espace vide
					{
						let traversable = cases[currentLvl.world.matrix[i][j]].traversable || false;
						let letal = cases[currentLvl.world.matrix[i][j]].letal || false;
						let texture = cases[currentLvl.world.matrix[i][j]].texture;
						this.matrix[i][j] = new Tile(new Vector(j*GLOBAL.BSIZE.x, i*GLOBAL.BSIZE.y), texture, traversable, letal);
					}
					else // Sinon on met la case à undefined
					{
						this.matrix[i][j] = undefined;
					}
				}
			}
		}

		// On retourne true lorsque le niveau est chargé
		return true;
	}

	// Mise à jour de l'état du monde
	step(delta)
	{
		let that = this;
		let body = that.player;

		// On centre la position du joueur
		let posx = Math.floor((body.origin.x+GLOBAL.BSIZE.x/2)/GLOBAL.BSIZE.x);
		let posy = Math.floor((body.origin.y+GLOBAL.BSIZE.y/2)/GLOBAL.BSIZE.y);

		// On met à jour la variable indiquant le dernier coups reçu par le joueur
		that.lastHit+=delta;

		// Si le joueur tombe dans le vide on le remet au début du niveau
		if (posy >= this.height + 10)
		{
			body.origin = new Vector(this.spawn.x, this.spawn.y);
			body.velocity = new Vector(0,0);
			body.life -=1;
			return;
		}

		// On ajoute la gravité (TP moteur physique)
		body.force = body.force.add(GLOBAL.gravity);
		// On calcule la nouvelle accéleration :
		var a = body.force.mult(body.invMass);
		body.force = Vector.ZERO;
		var delta_v = a;
		body.velocity = body.velocity.add(delta_v);

		// On teste la collision sur un rayon de 2 blocs autour du joueur
		for (let i = posy-2 ; i < posy+2; ++i)
		{
			for (let j = posx-2; j < posx+2; ++j)
			{
				if(i == posx && j == posy) {continue;}
				if(i < 0 || i >= this.height) {continue;}
				if(j < 0 || j >= this.width) {continue;}

				let tile = that.matrix[i][j];
				if(tile != undefined) // S'il y a un bloc
				{
					if(AABB(body, tile)) // S'il y a collision
					{
						if(this.exit.x == j && this.exit.y == i) // Si le bloc en question est la fin de niveau
						{
							return true;
						}

						// Si le bloc est traversable on oublie
						if(tile.traversable) {continue;}

						// Repositionnement du personnage (méthode à améliorer ;( ))
						if (i == posy) // S'il s'agit du bloc de gauche ou de droite
						{
							// On repositionne dans le bon sens
							if (body.origin.x < tile.origin.x)
							{
								let x = body.origin.x + body.width - tile.origin.x;
								body.move(new Vector(-x,0));
							}
							else
							{
								let x = tile.origin.x + tile.width - body.origin.x;
								body.move(new Vector(x,0));
							}
						}
						else // S'il s'agit d'un autre bloc (Haut ou bas ou diagonale)
						{
							body.is_jumping = false;// le joueur ne saute plus
							body.velocity.y = 0;// il perd sa vitesse en y
							// On repositionne dans le bon sens
							if(body.origin.y < tile.origin.y)
							{
								let y = body.origin.y + body.height - tile.origin.y;
								body.move(new Vector(0, -y));
							}
							else
							{
								let y = tile.origin.y + tile.height - body.origin.y;
								body.move(new Vector(0, y));
							}
						}
						if(tile.letal)// Si le bloc est létal
						{
							// On teste depuis quand le joueur a pris des dégats
							if(this.lastHit >= 1)// Si ça fait plus d'une seconde
							{
								body.is_hurt = true;// On précises que le joueur est dans l'état blessé
								body.life-=1;// Il perd une vie
								this.lastHit = 0;// On reset le dernier coup
							}
						}
					}
				}
			}
		}

		// On précise que le joueur n'ai plus blessé
		if(this.lastHit >= 1)
		{
			body.is_hurt = false;
		}

		//On met à jour sa position
		body.move(body.velocity);

		// On limite la position du joueur en x pour ne pas sortir du niveau
		body.origin.x = Math.min(Math.max(0, body.origin.x), this.width*GLOBAL.BSIZE.x - GLOBAL.BSIZE.x);
		return false;
	}

};
