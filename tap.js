let five = require('johnny-five')
let TAU = Math.PI * 2

let tap = new five.Board()
let Arm = require('./arm')
let Home = require('./home')
let Position = require('./position')
let Tapper = require('./tapper')
let zAxis = require('./z-axis')

tap.on('ready', () => {
  tap.name = tap.io.firmware.name.split('.')[0]

  let enablePin = new five.Pin({pin: 8, type: 'digital', mode: 1})

  let a = new Arm({
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

  let b = new Arm({
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

  let z = new zAxis()

  let home = new Home({a:a, b:b, z:z})

  let position = new Position({a:a, b:b})

  a.on('position', data => {
    //console.log(a.label + ' position update: ' + data.x1 + ', ' + data.y1)
    position.update()
  })

  b.on('position', data => {
    //console.log(b.label + ' position update: ' + data.x1 + ', ' + data.y1)
    position.update()
  })

  // Solenoid End Effector
  let tapper = new Tapper(17, 18)   // On Arduino, pin A3 = 17, A4 = 18

  let t0 = {
    name: this.name,
    a: a,
    b: b,
    z: z,
    e: tapper,
    enablePin: enablePin,
    home: home,
    position: position
  }

  tap.repl.cmd.ignoreUndefined = true
  tap.repl.inject({ five, tap, t0 })

  console.log(tap.name + ' Ready!')
  setTimeout( () => { t0.home.ZAB() }, 500)

})