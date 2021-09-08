class Character extends Entity
{
	constructor(position, mass = 1)
	{
		super(position, mass);
		this.life = 5;
		this.is_jumping = false;
		this.is_hurt = false;
	}
}
