const Part = require('./Part')
const { EventEmitter } = require('events')
const { spawn } = require('child_process')
const { Stream, PassThrough } = require('stream')

class FFmkek extends EventEmitter {
  constructor(source) {
    super()
    this.currentPart = new Part(this, 0)
    this.parts = []

    this.inputStream = null
    this.outputStream = null

    this.force = true

    if (source) this.addInput(source)
    this._setAliases()
  }

  addInput(input) {
    return this._addPart(input, Part.INPUT)
  }

  setOutput(output) {
    return this._addPart(output, Part.OUTPUT)
  }

  addOption(name, ...values) {
    this.currentPart.addOption(name, ...values)
    return this
  }

  setForce(flag) {
    this.force = Boolean(flag)
    return this
  }

  getArguments() {
    const args = []
    for (const part of this.parts) part.apply(args)
    if (this.force) args.push('-y')
    return args
  }

  run() {
    if (!this._outputPart) this.setOutput(new PassThrough())
    const proc = spawn('ffmpeg', this.getArguments())
    if (this.inputStream) this.inputStream.pipe(proc.stdin)
    if (this.outputStream) proc.stdout.pipe(this.outputStream)

    proc.stderr.on('data', data => this.emit('info', data.toString()))

    return new Promise(resolve => {
      if (this.outputStream) {
        return resolve(this.outputStream)
      }
      proc.stderr.once('end', () => resolve(this._outputPart.name))
    })
  }

  write(output) {
    if (output) this.setOutput(output)
    return this.run()
  }

  get _outputPart() {
    return this.parts.find(part => part.type === Part.OUTPUT)
  }

  _addPart(io, type) {
    if (io instanceof Stream) {
      const isOutput = type === Part.OUTPUT
      const prop = isOutput  ? 'outputStream' : 'inputStream'
      if (this[prop]) {
        throw new Error('only one input or output stream is supported')
      }

      this[prop] = io
      this.currentPart.setName(`pipe:${isOutput ? 1 : 0}`)
    } else {
      this.currentPart.setName(io)
    }

    this.currentPart.setType(type)
    this.parts.push(this.currentPart)
    this.currentPart = new Part(this, this.parts.length)
    return this
  }

  _setAliases() {
    const proto = FFmkek.prototype
    this._alias(proto.addInput, 'in', 'input')
      ._alias(proto.setOutput, 'out', 'output', 'addOutput')
      ._alias(proto.addOption, 'opt', 'option')
      ._alias(proto.getArguments, 'args', 'arguments')
      ._alias(proto.write, 'save')
  }

  _alias(method, ...aliases) {
    for (const alias of aliases) this[alias] = method.bind(this)
    return this
  }

  static get Part() {
    return Part
  }
}

module.exports = FFmkek
