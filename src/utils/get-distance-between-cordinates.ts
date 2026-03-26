export interface Coordinates {
  latitude: number
  longitude: number
}

export function getDistanceBetweenCoordinates(
  from: Coordinates,
  to: Coordinates,
) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0
  }

  const fromRadian = (Math.PI * from.latitude) / 180
  const toRadian = (Math.PI * to.latitude) / 180

  const theta = from.longitude - to.longitude
  const thetaRadian = (Math.PI * theta) / 180

  let distance =
    Math.sin(fromRadian) * Math.sin(toRadian) +
    Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(thetaRadian)

  if (distance > 1) {
    distance = 1
  }

  distance = Math.acos(distance)
  distance = (distance * 180) / Math.PI
  distance = distance * 60 * 1.1515
  distance = distance * 1.609344

  return distance
}
