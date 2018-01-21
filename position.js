let TAU = Math.PI * 2
let ccintersect = require('./circle-circle-intersect')

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

  pointer() {
    let loc = this.intersect()

    if (loc[0] == 1) {
      return [ loc[1][0], loc[1][1] ]
    } else {
      return [0, 0]
    }
  }

  update() {
    let [x2, y2] = this.pointer()
    this.a.position.x2 = x2
    this.a.position.y2 = y2
    this.b.position.x2 = x2
    this.b.position.y2 = y2
    this.x = x2
    this.y = y2
  }

  go(x, y) {
    let a = this.a.position
    let b = this.b.position
    let newA = {}
    let newB = {}

    newA.loc = ccintersect(a.x0, a.y0, this.a.r0, x, y, this.a.r1)[1]
    // FIXME: Check for NaN
    newA.angle = angle(a.x0, a.y0, newA.loc[0], newA.loc[1])
    // FIXME: Bounds check new angle

    newB.loc = ccintersect(b.x0, b.y0, this.b.r0, x, y, this.b.r1)[1]
    // FIXME: Check for NaN
    newB.angle = angle(b.x0, b.y0, newB.loc[2], newB.loc[3])
    // FIXME: Bounds check new angle

    console.log(newA.angle)
    console.log(newB.angle)

    this.a.angle = newA.angle
    this.b.angle = newB.angle
  }

  get() {
    return [this.x, this.y]
  }

  angles() {
    return [this.a.angle, this.b.angle]
  }

}

module.exports = Position