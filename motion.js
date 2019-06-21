/*

Usage:
> motion = require('./motion')
> motion.directionVector([0,0,-100], [5,10,-150])
[ 5, 10, -50 ]

> let A = [1,6,3]
> let B = [8,2,7]
> motion.directionVector(A, B)
[ 7, -4, 4 ]


Reference:
Line between two points in 3D space: http://mathcentral.uregina.ca/QQ/database/QQ.09.01/murray2.html
Easing functions: https://gist.github.com/gre/1650294

*/
let EasingFunctions = {
  linear: function (t) { return t },
  easeInQuad: function (t) { return t*t },
  easeOutQuad: function (t) { return t*(2-t) },
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  easeInCubic: function (t) { return t*t*t },
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  easeInQuart: function (t) { return t*t*t*t },
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  easeInQuint: function (t) { return t*t*t*t*t },
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}


let directionVector = function(pointA, pointB) {
  let vector = [ pointB[0] - pointA[0],
                 pointB[1] - pointA[1],
                 pointB[2] - pointA[2] ]
  return vector
}

let length = function(pointA, pointB) {
  let vector = directionVector(pointA, pointB)
  return Math.sqrt((vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]))
}

// (x,y,z) = (1,6,3) + t(7,-4,4) = (1 + 7t, 6 - 4t, 3 + 4t).
let parametricEquation = function(pointA, pointB) {
  let dv = directionVector(pointA, pointB)
  let equation = function(t) {
    return [ Math.round((pointA[0] + dv[0]*t) * 100) / 100,
             Math.round((pointA[1] + dv[1]*t) * 100) / 100,
             Math.round((pointA[2] + dv[2]*t) * 100) / 100 ]
  }
  return equation
}

// get an array of points between (and including) two end points
// numberOfSteps and easingType are required
let points = function(pointA, pointB, numberOfSteps = 5, easingType = 'linear') {
  let allPoints = []
  let point = parametricEquation(pointA, pointB)
  let easingFunction = EasingFunctions[easingType]

  for (let i = 0; i <= numberOfSteps; i++) {
    t = easingFunction(i/numberOfSteps)
    allPoints.push(point(t))
  }
  return allPoints
}

exports.directionVector = directionVector
exports.length = length
exports.parametricEquation = parametricEquation
exports.points = points