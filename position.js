let TAU = Math.PI * 2
let ccintersect = require('./circle-circle-intersect')
let motion = require('./motion')

function angle(cx, cy, ex, ey) {
  let dy = ey - cy
  let dx = ex - cx
  let theta = Math.atan2(dy, dx) // range (-PI, PI]
  theta *= 360 / TAU // rads to degs, range (-180, 180]
  if (theta < -100) {
    theta += 360   // range [0, 360)
  }
  return theta
}


class Position {
  constructor(opts) {
    this.a = opts.a
    this.b = opts.b
    this.x = null
    this.y = null
  }

  intersect() {
    let a = this.a.position
    let b = this.b.position
    return ccintersect(a.x1, a.y1, this.a.r1, b.x1, b.y1, this.b.r1)
  }

  x2y2() {
    // Get current x2y2 position
    let loc = this.intersect()
    if (loc[0] == 1) {
      return [ loc[1][0], loc[1][1] ]
    } else {
      return [0, 0]
    }
  }

  calcOffset(x = null, y = null) {
    // Calculate new x2y2 position
    if (x == null) { return }
    if (typeof(x) !== 'number') { return }
    if (y == null) { return }
    if (typeof(y) !== 'number') { return }

    let a = this.a.position
    let result, newX1Y1

    // Calculate new position for (x1, y1)
    [result, newX1Y1] = ccintersect(a.x0, a.y0, this.a.r0, x, y, this.a.r1)
    // Check for NaN
    if (result == 0) { return false }

    // Calculate angle for new Eoffset
    let angle = Math.atan2(y - newX1Y1[1], x - newX1Y1[0])

    // Calculate new angle for point E
    angle -= Math.atan2(12.5,102)

    let x_prime = 104 * Math.cos(angle)
    let y_prime = 104 * Math.sin(angle)

    x_prime += newX1Y1[0]
    y_prime += newX1Y1[1]

    return [x_prime, y_prime]

  }

  end_effector() {
    let a = this.a.position
    //let b = this.b.position
    let angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1)
    angle += Math.atan2(12.5,102)

    // Translate to origin
    let p = {}
    p.x = 102.763077026722 // Math.sqrt((102*102)+(12.5*12.5))   (102 is a.r1 - 2)
    p.y = 0

    // Rotate point
    let x_prime = (p.x * Math.cos(angle)) - (p.y * Math.sin(angle))
    let y_prime = (p.x * Math.sin(angle)) + (p.y * Math.cos(angle))

    p.x = x_prime + a.x1
    p.y = y_prime + a.y1

    return [p.x, p.y]
  }

  update() {
    let [x2, y2] = this.x2y2()
    this.a.position.x2 = x2
    this.a.position.y2 = y2
    this.b.position.x2 = x2
    this.b.position.y2 = y2
    this.x = x2
    this.y = y2
  }

  isValidDestination(x = null, y = null) {
    if (x == null) { return false}
    if (typeof(x) !== 'number') { return false }
    if (y == null) { return false }
    if (typeof(y) !== 'number') { return false }

    let a = this.a.position
    let b = this.b.position
    let newA = {}
    let newB = {}
    let result

    [result, newA.loc] = ccintersect(a.x0, a.y0, this.a.r0, x, y, this.a.r1)
    // Check for NaN
    if (result == 0) { return false }
    newA.angle = angle(a.x0, a.y0, newA.loc[0], newA.loc[1])
    // Bounds check new angle
    if ((newA.angle > this.a.theta_home) || (newA.angle < this.a.theta_max)) { return false }


    [result, newB.loc] = ccintersect(b.x0, b.y0, this.b.r0, x, y, this.b.r1)
    // Check for NaN
    if (result == 0) { return false }
    newB.angle = angle(b.x0, b.y0, newB.loc[2], newB.loc[3])
    // Bounds check new angle
    if ((newB.angle < this.b.theta_home) || (newB.angle > this.b.theta_max)) { return false }

    return true
  }

  _go(x = null, y = null) {
    if (this.isValidDestination(x, y) == false) { return }

    let a = this.a.position
    let b = this.b.position
    let newA = {}
    let newB = {}
    let result

    {[result, newA.loc] = ccintersect(a.x0, a.y0, this.a.r0, x, y, this.a.r1)}
    newA.angle = angle(a.x0, a.y0, newA.loc[0], newA.loc[1])
    newA.angle = Math.round(newA.angle * 100) / 100

    // Need brackets {} thanks to ASI and lines that start with [
    {[result, newB.loc] = ccintersect(b.x0, b.y0, this.b.r0, x, y, this.b.r1)}
    newB.angle = angle(b.x0, b.y0, newB.loc[2], newB.loc[3])
    newB.angle = Math.round(newB.angle * 100) / 100

    // console.log(newA.angle)
    // console.log(newB.angle)

    this.a.angle = newA.angle
    this.b.angle = newB.angle
  }

  go(x = null, y = null, timeDelta = 15, easingType = 'linear', numberOfSteps = null) {

    let newXY = this.calcOffset(x, y)

    if (this.isValidDestination(newXY[0], newXY[1]) == false) { return }

    let pointA = [this.x, this.y, 0]
    let pointB = [newXY[0], newXY[1], 0]
    let numSteps

    if (numberOfSteps !== null) {
      numSteps = numberOfSteps*2
    } else {
      numSteps = Math.round(motion.length(pointA, pointB))
      if (numSteps == 0) { return }
      numSteps *= 2
    }
    let points = motion.points(pointA, pointB, numSteps, easingType = easingType)
    for (let i = 0; i < points.length; i++) {
      setTimeout(this._go.bind(this), i * timeDelta, points[i][0], points[i][1])
      //console.log(points[i][0], points[i][1])
    }

    //setTimeout(function() { console.log('LENGTH: ' + numSteps) }, 2000)
  }


  get() {
    return [this.x, this.y]
  }

  angles() {
    return [this.a.angle, this.b.angle]
  }

}

module.exports = Position