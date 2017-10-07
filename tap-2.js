var five = require('johnny-five')
var board = new five.Board()
var Tapper = require('./tapper-2').Tapper

board.on('ready', function() {  

  var xArm = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 3200,
      pins: {
        step: 2,
        dir: 5
      }
  })
  
  var yArm = new five.Stepper({
      type: five.Stepper.TYPE.DRIVER,
      stepsPerRev: 3200,
      pins: {
        step: 3,
        dir: 6
      }
  })  
  
  var zArm = function () {
    this.stepPin = new five.Pin({pin: 4, type: 'digital', mode: 1})
    this.dir = new five.Pin({pin: 7, type: 'digital', mode: 1})

    // Set inital direction
    this.dir.low() // Go up by default

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

  }
  z = new zArm()
  
  var dirPin = new five.Pin({pin: 17, type: 'digital', mode: 1})
  dirPin.high()
  var stepPin = new five.Pin({pin: 18, type: 'digital', mode: 1})
  
  var toggle = function() {
    stepPin.low()
    stepPin.high()
    stepPin.low()
    stepPin.high()
  }

  var delay = 50
  var tap = function () {
    toggle()
    setTimeout(
      function () {
        toggle()
      }, delay)
  }
  
  var tapper = new Tapper(stepPin)
  
  var moveOut = function(numSteps = 100) {
    if (numSteps > 0) {
      xArm.rpm(15).ccw().step(numSteps, ()=>{})
      yArm.rpm(15).cw().step(numSteps, ()=>{})
    }
  }

  var moveIn = function(numSteps = 100) {
    if (numSteps > 0) {
      xArm.rpm(15).cw().step(numSteps, ()=>{})
      yArm.rpm(15).ccw().step(numSteps, ()=>{})
    }
  }  
  
  
  this.repl.cmd.ignoreUndefined = true
  this.repl.inject({
      five: five,
      board: board,
      dirPin: dirPin,
      stepPin: stepPin,
      toggle: toggle,
      tap: tap,
      moveIn: moveIn,
      moveOut: moveOut,
      x: xArm,
      y: yArm,      
      z: z,
      tapper: tapper        
  })

  console.log('Ready!')
})


// var enablePin = new five.Pin({pin: 8, type: 'digital', mode: 1})


