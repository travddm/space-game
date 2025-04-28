export function getAngleBetweenVectors(vectorA: Vector3, vectorB: Vector3) {
	return math.acos(vectorA.Dot(vectorB));
}
