var five = require('johnny-five')

var zAxis = function() {
  this.position = {step: null}
  this.stepPin = new five.Pin({pin: 4, type: 'digital', mode: 1})
  this.dir = new five.Pin({pin: 7, type: 'digital', mode: 1})
  this.limit = -190

  // Set inital direction
  this.dir.low() // Go up by default

  // Set initial step value
  this.stepPin.low()

  this.step = function(numSteps = 1) {
    if (numSteps >= 0) {
      this.dir.low()
    } else {
      this.dir.high()
    }
    for (var i = 0; i < Math.abs(numSteps); i++) {
      this.stepPin.low()
      this.stepPin.high()
    }
  }

  this.up = function(numSteps = 1) {
    // Check if valid
    if (this.position.step == null) { return }
    if (typeof(numSteps) !== 'number') { return }
    if (numSteps <= 0) { return }

    if (this.position.step + numSteps > 0) {
      return
    } else {
      this.step(numSteps)
      this.position.step += numSteps
    }
  }

  this.down = function(numSteps = 1) {
    // Check if valid
    if (this.position.step == null) { return }
    if (typeof(numSteps) !== 'number') { return }
    if (numSteps <= 0) { return }

     if (this.position.step - numSteps < this.limit) {
       return
     } else {
       this.step(-numSteps)
       this.position.step -= numSteps
     }
  }

  this.limitSwitch = new five.Button({
      pin: 12,
      invert: true
  })

  this.limitSwitch.on('press', function() {
    console.log( 'Z closed' )
  })

  this.limitSwitch.on('release', function() {
    console.log( 'Z open' )
  })


  this.home = function(interval = 4) {
    if (this.limitSwitch.value == 1) {
      this.position.step = 0
      return
    } else {
      this.step(1)
      setTimeout(this.home.bind(this), interval, interval)
    }
  }
}

module.exports = zAxis

// Test cases
// >> z.down(50)
// >> z.down()
// >> z.down(0)
// >> z.down(1000)
// >> z.down(-1000)
// >> z.down('yo')
// >> z.home()