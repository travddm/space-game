export function getAngleBetweenVectors(vectorA: Vector3, vectorB: Vector3) {
	return math.acos(vectorA.Dot(vectorB));
}

export function getIntersectionY(point: Vector3, direction: Vector3) {
	if (direction.Y === 0) return new Vector3(point.X, 0, point.Z);

	const t = -point.Y / direction.Y;

	return new Vector3(point.X + t * direction.X, 0, point.Z + t * direction.Z);
}
