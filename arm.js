let inherits = require('util').inherits
let EventEmitter = require('events').EventEmitter
let five = require('johnny-five')
let TAU = Math.PI * 2

class Arm {

  constructor(opts) {
    this.label = opts.label
    this.position = {x0: opts.x0, y0: opts.y0, x1: null, y1: null, step: null}
    this.homeDirection = opts.homeDirection
    this.stepsPerRev = 3200
    this.theta_home = opts.theta_home
    this.theta_max = opts.theta_max
    this.r0 = opts.r0
    this.r1 = opts.r1

    this.motor = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: this.stepsPerRev,
      pins: {
        step: opts.stepPin,
        dir: opts.dirPin
      }
    })

    this.limitSwitch = new five.Button({
        pin: opts.limitPin,
        invert: true
    })
    this.limitSwitch.label = opts.label

    this.limitSwitch.on('press', function() {
        console.log( this.label + ' closed' )
    })

    this.limitSwitch.on('release', function() {
      console.log( this.label + ' open' )
    })

    EventEmitter.call(this)

    this.setMaxListeners(100)
  }

  get angle() {
    if (this.label == "A") {
      return Math.round((this.theta_home - (this.position.step / this.stepsPerRev * 360)) * 100) / 100
    } else {
      return Math.round((this.theta_home + (this.position.step / this.stepsPerRev * 360)) * 100) / 100
    }
  }

  set angle(theta) {
    if (this.position.step == null) { return }
    if (this.label == "A") {
      if ((theta > this.theta_home) || (theta < this.theta_max)) { return }
    } else {
      if ((theta < this.theta_home) || (theta > this.theta_max)) { return }
    }

    let steps = Math.round( this.stepsPerRev / 360 * (theta - this.angle) )

    if (steps > 0) {
       this.ccw(steps)
    } else {
      steps = Math.abs(steps)
      this.cw(steps)
    }
  }

  updatePosition() {
    this.position.x1 = this.position.x0 + Math.round((Math.cos(TAU * this.angle / 360) * this.r0) * 100) / 100
    this.position.y1 = Math.round((Math.sin(TAU * this.angle / 360) * this.r0) * 100) / 100

    // Notify listeners
    this.emit('position', this.position)
  }

  cw(numSteps = 100, rpm = 15) {
    // Check if valid
    if (this.position.step == null) { return }
    if (typeof(numSteps) !== 'number') { return }
    if (numSteps <= 0) { return }


    if (this.homeDirection == 1) {
      this.position.step += numSteps
    } else {
      if (this.position.step - numSteps < 0) { return }
      this.position.step -= numSteps
    }
    this.motor.step({steps: numSteps, direction:0, rpm:rpm}, ()=>{})
    this.updatePosition()
  }

  ccw(numSteps = 100, rpm = 15) {
    // Check if valid
    if (this.position.step == null) { return }
    if (typeof(numSteps) !== 'number') { return }
    if (numSteps <= 0) { return }


    if (this.homeDirection == 1) {
      if (this.position.step - numSteps < 0) { return }
      this.position.step -= numSteps
    } else {
      this.position.step += numSteps
    }
    this.motor.step({steps: numSteps, direction:1, rpm:rpm}, ()=>{})
    this.updatePosition()
  }

  home(interval = 4){
    if (this.limitSwitch.value == 1) {
      this.position.step = 0
      this.updatePosition()
      return
    } else {
      this.motor.step({steps: 1, direction: this.homeDirection, rpm:15}, ()=>{})
      setTimeout(this.home.bind(this), interval, interval)
    }
  }

}

inherits(Arm, EventEmitter)

module.exports = Arm