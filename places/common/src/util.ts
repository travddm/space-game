export function getAngleBetweenVectors(vectorA: Vector3, vectorB: Vector3) {
	return math.acos(vectorA.Dot(vectorB));
}

export function getAngleDifferenceY(vectorA: Vector3, vectorB: Vector3) {
	const dot = vectorA.X * vectorB.X + vectorA.Z * vectorB.Z;
	const det = vectorA.X * vectorB.Z - vectorA.Z * vectorB.X;

	return math.atan2(det, dot);
}

export function rotateVectorY(vector: Vector3, radians: number) {
	const x = vector.X;
	const z = vector.Z;
	const cos = math.cos(radians);
	const sin = math.sin(radians);

	return new Vector3(x * cos - z * sin, vector.Y, x * sin + z * cos);
}

export function getIntersectionY(point: Vector3, direction: Vector3) {
	if (direction.Y === 0) return new Vector3(point.X, 0, point.Z);

	const t = -point.Y / direction.Y;

	return new Vector3(point.X + t * direction.X, 0, point.Z + t * direction.Z);
}
