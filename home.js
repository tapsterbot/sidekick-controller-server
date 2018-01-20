class Home {

  constructor(opts) {
    this.a = opts.a
    this.b = opts.b
    this.z = opts.z
  }

  A(callback){
    let interval = 4
    if (this.a.limitSwitch.value == 1) {
      this.a.position.step = 0

      if (typeof(callback) === 'undefined') {
        return
      } else {
        callback()
      }

    } else {
      this.a.motor.step({steps: 1, direction: this.a.homeDirection, rpm:10}, ()=>{})
      this.b.motor.step({steps: 1, direction: this.a.homeDirection, rpm:10}, ()=>{})
      setTimeout(this.A.bind(this), interval, callback)
    }
  }

  B(callback) {
    let interval = 4
    if (this.b.limitSwitch.value == 1) {
      this.b.position.step = 0

      if (typeof(callback) === 'undefined') {
        return
      } else {
        callback()
      }

    } else {
      this.b.motor.step({steps: 1, direction: this.b.homeDirection, rpm:10}, ()=>{})
      this.a.cw(1, 10)
      setTimeout(this.B.bind(this), interval, callback)
    }
    this.a.updatePosition()
    this.b.updatePosition()
  }

  AB() {
    this.A(this.B.bind(this))
  }

  ZAB() {
    // Attach listeners, so things happen and in the right order...
    this._bound_bPressedListener = this.bPressedListener.bind(this)
    this.b.limitSwitch.addListener('press', this._bound_bPressedListener)

    if (this.z.limitSwitch.value == 1) {
      this.AB()
    } else {
      this._bound_zPressedListener = this.zPressedListener.bind(this)
      this.z.limitSwitch.addListener('press', this._bound_zPressedListener)
    }
    this.z.home()
  }

  zPressedListener() {
    this.z.limitSwitch.removeListener('press', this._bound_zPressedListener)
    this.AB()
  }


  bPressedListener() {
    this.b.limitSwitch.removeListener('press', this._bound_bPressedListener)
    this.rest()
  }

  rest() {
    this.b.angle = 10
    this.a.angle = 170
  }

}


module.exports = Home