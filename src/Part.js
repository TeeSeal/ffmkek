class Part {
  constructor(name, type) {
    this.name = null
    this.type = null
    this.options = new Map()

    this.setName(name).setType(type)
  }

  addOption(name, ...values) {
    if (!this.options.has(name)) this.options.set(name, [])
    this.options.get(name).push(...values)
    return this
  }

  setName(name) {
    this.name = name
    return this
  }

  setType(type) {
    if (![Part.INPUT, Part.OUTPUT].includes(type)) type = Part.INPUT
    this.type = type
    return this
  }

  apply(args) {
    for (const [name, values] of this.options) {
      args.push(name)
      if (values.length) args.push(values.join(', '))
    }

    if (this.type === Part.INPUT) args.push('-i')
    args.push(this.name)
    return args
  }

  static get INPUT() {
    return 'input'
  }

  static get OUTPUT() {
    return 'output'
  }
}

module.exports = Part
