class Entity extends Rect
{
	constructor(position, mass = Infinity, dim = GLOBAL.BSIZE, traversable = false, letal = false)
	{
		super(position, dim);
		this.traversable = traversable; // Entité traversable ?
		this.letal = letal; // Entité létal ?
		this.back_pos = position;
		this.mass = mass || 0;  // masse
		this.invMass = 1/this.mass;
		this.velocity = Vector.ZERO;// vitesse
		this.force = Vector.ZERO;// force
	}
}
