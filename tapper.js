let five = require('johnny-five')

class Tapper {

  constructor(dirPin, solenoidPin) {
    // CNC Shield - 4th Axis (A) direction pin
    this.dir = new five.Pin({pin: dirPin, type: 'digital', mode: 1})
    this.dir.high()

    // CNC Shield - 4th Axis (A) "step" pin
    this.solenoid = new five.Pin({pin: solenoidPin, type: 'digital', mode: 1})

    this.tapDelay = 45
    this.intervalDelay = 90
    this.ringDelay = 2000
    this._interval = null
    this._started = false
  }

  toggle() {
    this.solenoid.low()
    this.solenoid.high()
    this.solenoid.low()
    this.solenoid.high()
  }

  tap() {
    this.toggle()

    setTimeout(
      function (_this) {
        _this.toggle()
      },
      this.tapDelay,
      this
    )
  }

  start() {
    if (this._started === false) {
      this._interval = setInterval(this.tap.bind(this), this.intervalDelay)
      this._started = true
    }
  }

  stop() {
    clearInterval(this._interval)
    this._started = false
  }

  ring(times = 1) {
    let delay = this.ringDelay
    if ( Number.isInteger(times) && (times > 0) ) {
      for (let i = 0; i < times; i++ ) {
        setTimeout(function (_this){ _this.start() }, 0 + (i * (delay*2)), this)
        setTimeout(function (_this){ _this.stop() }, delay + (i * (delay*2)), this)
      }
    }
  }

}

module.exports = Tapper