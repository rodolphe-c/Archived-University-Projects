class Rect
{
	constructor (v, dim = GLOBAL.BSIZE)
	{
		this.origin = v;
		Object.defineProperty ( this, "width", { writable: false, value : 64 });
		Object.defineProperty ( this, "height", { writable: false, value : 64 });
	}

	move (v)
	{
		this.origin = this.origin.add(v);
	}
	
	hasOrigin()
	{
		return (this.origin.x < 0 && this.origin.x + this.width > 0)
		&& (this.origin.y < 0 && this.origin.y + this.height > 0);
	}
};
