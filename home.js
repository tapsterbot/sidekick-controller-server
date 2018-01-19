var Home = function(opts) {
  this.a = opts.a
  this.b = opts.b
  this.z = opts.z
}

Home.prototype.homeA = function(callback){
  var interval = 4
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
    setTimeout(this.homeA.bind(this), interval, callback)
  }
}


Home.prototype.homeB = function(callback) {
  var interval = 4
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
    setTimeout(this.homeB.bind(this), interval, callback)
  }
  this.a.updatePosition()
  this.b.updatePosition()
}


Home.prototype.homeAB = function() {
  this.homeA(this.homeB.bind(this))
}


Home.prototype.homeABZ = function() {
  // Attach listeners, so things happen and in the right order...
  this._bound_bPressedListener = this.bPressedListener.bind(this)
  this.b.limitSwitch.addListener('press', this._bound_bPressedListener)

  if (this.z.limitSwitch.value == 1) {
    this.homeAB()
  } else {
    this._bound_zPressedListener = this.zPressedListener.bind(this)
    this.z.limitSwitch.addListener('press', this._bound_zPressedListener)
  }

  this.z.home()
}


Home.prototype.zPressedListener = function() {
  this.z.limitSwitch.removeListener('press', this._bound_zPressedListener)
  this.homeAB()
}


Home.prototype.bPressedListener = function() {
  this.b.limitSwitch.removeListener('press', this._bound_bPressedListener)
  this.rest()
}


Home.prototype.rest = function() {
   this.b.move_to(10)
   this.a.move_to(170)
}


module.exports = Home