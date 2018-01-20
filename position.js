let ccintersect = require('./circle-circle-intersect')

class Position {
  constructor(opts) {
    this.a = opts.a
    this.b = opts.b
    this.x = null
    this.y = null
  }

  intersect() {
    let result = ccintersect(this.a.position.x1, this.a.position.y1, this.a.r1,
                             this.b.position.x1, this.b.position.y1, this.b.r1)
    return result
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

}

module.exports = Position