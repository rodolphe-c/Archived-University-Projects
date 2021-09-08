class Camera
{
	constructor(width, height, map_w, map_h)
	{
		this.map_width = map_w; // largeur en bloc
		this.map_height = map_h; // hauteur en bloc
		this.screen    = new Vector(width,height); // Largeur et hauteur du canvas
		this.startTile = new Vector(0,0); // Bloc en haut à gauche
		this.endTile   = new Vector(0,0);// Bloc en bas à droite
		this.offset    = new Vector(0,0); // Décalage de la zone à dessiner
	}

	// On met à jour la position de la camera
	update (px, py)
	{

		// Calcul du décalage de la camera par rapport au centre du canvas et le joueur
		this.offset.x = Math.floor((this.screen.x/2) - px);
		this.offset.y = Math.floor((this.screen.y/2) - py);

		// Tile au centre de l'écran pour pouvoir calculer startTile et endTile
		let tile = new Vector(Math.floor(px/GLOBAL.BSIZE.x), Math.floor(py/GLOBAL.BSIZE.y));

		// Côté gauche
		this.startTile.x = tile.x - 1 - Math.ceil((this.screen.x/2) / GLOBAL.BSIZE.x);
		this.startTile.y = tile.y - 1 - Math.ceil((this.screen.y/2) / GLOBAL.BSIZE.y);

		if(this.startTile.x < 0)
		{
			this.startTile.x = 0;
		}

		if(this.startTile.y < 0)
		{
			this.startTile.y = 0;
		}

		// Côté droit
		this.endTile.x = tile.x + 1 + Math.ceil((this.screen.x/2) / GLOBAL.BSIZE.x);
		this.endTile.y = tile.y + 1 + Math.ceil((this.screen.y/2) / GLOBAL.BSIZE.y);

		if(this.endTile.x >= this.map_width)
		{
			this.endTile.x = this.map_width-1;
		}
		if(this.endTile.y >= this.map_height)
		{
			this.endTile.y = this.map_height-1;
		}
	}
};
