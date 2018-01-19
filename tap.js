var five = require('johnny-five')
var tap = new five.Board()
var ccintersect = require('./circle-circle-intersect')
var Tapper = require('./tapper-2').Tapper
var zAxis = require('./z-axis')
var Arm = require('./arm')
var Home = require('./home')
var TAU = Math.PI * 2

tap.on('ready', function() {
  this.name = this.io.firmware.name.split('.')[0]

  var enablePin = new five.Pin({pin: 8, type: 'digital', mode: 1})

  var a = new Arm({
    stepPin: 2,
    dirPin: 5,
    limitPin: 9,
    label: "A",
    homeDirection: 1,
    theta_home: 240,
    theta_max: 30,
    x0: -24,
    y0: 0,
    r0: 8*9,
    r1: 8*13
  })

  var b = new Arm({
    stepPin: 3,
    dirPin: 6,
    limitPin: 10,
    label: "B",
    homeDirection: 0,
    theta_home: -60,
    theta_max: 150,
    x0: 24,
    y0: 0,
    r0: 8*9,
    r1: 8*13
  })

  var z = new zAxis()

  var home = new Home({a:a, b:b, z:z})

  // Solenoid End Effector
  var tapper = new Tapper(17, 18)   // On Arduino, pin A3 = 17, A4 = 18

  var t0 = {
    name: this.name,
    a: a,
    b: b,
    z: z,
    e: tapper,
    enablePin: enablePin,
    home: home
  }

  this.repl.cmd.ignoreUndefined = true
  this.repl.inject({
      five: five,
      tap: this,
      t0: t0
  })

  console.log(this.name + ' Ready!')
  setTimeout(function() { t0.home.homeABZ() }, 500)

})