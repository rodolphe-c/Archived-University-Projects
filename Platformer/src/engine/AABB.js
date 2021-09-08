// Détection de collision
function AABB (A,B)
{
		if(A.origin.x < B.origin.x + B.width &&
		A.origin.x + A.width > B.origin.x &&
		A.origin.y < B.origin.y + B.height &&
		A.height + A.origin.y > B.origin.y)
		{
			return true;
		}
		return false;
}
