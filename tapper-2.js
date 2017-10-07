exports.Tapper = function (solenoidPin) {
  this.solenoid = solenoidPin
  this.tapDelay = 45
  this.intervalDelay = 90
  this.ringDelay = 2000
  this._interval = null  
  this._started = false  

  this.tap = function () {
    this.solenoid.low()
    this.solenoid.high() 
    this.solenoid.low()
    this.solenoid.high()  

    setTimeout(
      function (_this) {
        _this.solenoid.low() 
        _this.solenoid.high()
        _this.solenoid.low()
        _this.solenoid.high()
      }, 
      this.tapDelay, 
      this
    )
  }

  this.start = function () {
    if (this._started === false) {
      this._interval = setInterval(this.tap.bind(this), this.intervalDelay)
      this._started = true
    }
  }

  this.stop = function () {
    clearInterval(this._interval)
    this._started = false
  }

  this.ring = function (times = 1) {
    var delay = this.ringDelay
    if ( Number.isInteger(times) && (times > 0) ) {
      for (var i = 0; i < times; i++ ) {
        setTimeout(function (_this){ _this.start() }, 0 + (i * (delay*2)), this)
        setTimeout(function (_this){ _this.stop() }, delay + (i * (delay*2)), this)
      }
    }
  }

}