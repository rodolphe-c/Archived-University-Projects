class Tile extends Entity
{
	constructor(position, texture, traversable = false, letal = false, mass = Infinity)
	{
		super(position, mass, GLOBAL.BSISE, traversable, letal);

		this.texture = texture;
	}
}
