const Part = require('./Part')
const { EventEmitter } = require('events')
const { spawn } = require('child_process')
const { Stream, PassThrough }= require('stream')

class FFmkek extends EventEmitter {
  constructor(source) {
    super()
    this.currentPart = new Part()
    this.parts = []

    this.streamCount = 0
    this.inputStream = null
    this.outputStream = null

    this.force = true

    if (source) this.addInput(source)
  }

  addOption(name, ...values) {
    this.currentPart.addOption(name, ...values)
    return this
  }

  addInput(input) {
    return this._addPart(input, Part.INPUT)
  }

  setOutput(output) {
    return this._addPart(output, Part.OUTPUT)
  }

  setForce(flag) {
    this.force = Boolean(flag)
    return this
  }

  get outputPart() {
    return this.parts.find(part => part.type === Part.OUTPUT)
  }

  getArguments() {
    const args = []
    for (const part of this.parts) part.apply(args)
    if (this.force) args.push('-y')
    return args
  }

  run() {
    if (!this.outputPart) this.setOutput('kek.mp4')
    const proc = spawn('ffmpeg', this.getArguments())
    if (this.inputStream) this.inputStream.pipe(proc.stdin)
    if (this.outputStream) proc.stdout.pipe(this.outputStream)

    proc.stderr.on('data', data => this.emit('info', data.toString()))

    return new Promise(resolve => {
      if (this.outputStream) {
        return resolve(this.outputStream)
      }
      proc.stderr.once('end', () => resolve(this.outputPart.name))
    })
  }

  write(output) {
    this.setOutput(output || new PassThrough())
    return this.run()
  }

  _addPart(io, type) {
    if (io instanceof Stream) {
      const prop = type === Part.OUTPUT ? 'outputStream' : 'inputStream'
      if (this[prop]) throw new Error('only one input or output stream is supported')

      this[prop] = io
      this.currentPart.setName(`pipe:${this.streamCount}`)
      this.streamCount++
    } else {
      this.currentPart.setName(io)
    }

    this.currentPart.setType(type)
    this.parts.push(this.currentPart)
    this.currentPart = new Part()
    return this
  }
}

module.exports = FFmkek
