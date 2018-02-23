# FFmkek

A basic wrapper around FFmpeg for node.js.

## Installation

```
$ npm i ffmkek
```

## Requirements

* FFmpeg (see [FFmpeg instalation](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg))

## Examples

Options and inputs/outputs have to be added in the same order you would add them in your command line.

```js
const FFmkek = require('ffmkek')

// ffmpeg -i some/video.mp4 -i some/audio.mp3 -shortest -vf "scale=300:-1, crop=150:150:0:0" out.mp4 -y
new FFmkek()
  .addInput('some/video.mp4')
  .addInput('some/audio.mp3')
  .addOption('-shortest')
  .addOption('-vf', 'scale=300:-1', 'crop=150:150:0:0')
  .write('out.mp4')

// ffmpeg -i pipe:0 -c copy out.mp4 -y
new FFmkek()
  .addInput(someReadableStream)
  .addOption('-c', 'copy')
  .write('out.mp4')

// ffmpeg -i pipe:0 -f h264 pipe:1 -y
new FFmkek()
  .addInput(someReadableStream)
  .addOption('-f', 'h264')
  .write(someWriteableStream)
```

## FFmkek Documentation

### FFmkek.prototype.addInput(input)

Adds a new input to the command.

**Aliases**: `in`, `input`

**Params**:

* input: `string|Stream`
  The path to the input file or a readable stream.

**Returns**: `FFmkek`
The current command.

### FFmkek.prototype.setOutput(output)

Adds a new output to the command.

**Aliases**: `out`, `output`, `addOutput`

**Params**:

* output: `string|Stream`
  The path to the ouput file or a writeable stream.

**Returns**: `FFmkek`
The current command.

### FFmkek.prototype.addOption(name, [value1[, ...[, valueN]]])

Calls `addOption` on the current `Part`. See `Part.prototype.addOption()`.

**Aliases**: `opt`, `option`

**Params**:

* name: `string`
* valueN: `string`

**Returns**: `FFmkek`
The current command.

### FFmkek.prototype.setForce(flag)

Controls whether to add the `-y` option to the command or not. By default is set to true.

**Params**:

* flag: `boolean`

**Returns**: `FFmkek`
The current command.

### FFmkek.prototype.getArguments()

Formats the command arguments and returns them as an array.

**Aliases**: `args`, `arguments`

**Returns**: `Array<string>`
The current command arguments.

### FFmkek.prototype.run()

Executes the current command. If no output is set, creates a `PassThrough` stream.

**Returns**: `Promise<string|Stream>`
The path of the file or the Stream that was written to.

### FFmkek.prototype.write(output)

Shorthand for calling `setOutput()` and `run()`.

**Aliases**: `save`

**Params**:

* output: `string|Stream`
  The path to the ouput file or a writeable stream.

**Returns**: `Promise<string|Stream>`
The path of the file or the Stream that was written to.

## Part Documentation

A FFmkek instance usually contains multiple `Part`s. Parts are abstractisations of an input or an output.
Each part has:

* name: The file path or pipe number. (`some/folder/input.mp4` or `pipe:0`)
* type: `input` or `output`
* options: The options that belong to this `Part`

Upon calling `FFmkek.prototype.addInput()` or `FFmkek.prototype.setOutput()`, the current part is "closed", along with the options added prior to it, and pushed to the `parts` array, which is a property of FFmkek instances.
If you happen to need to modify a `Part` after calling those methods, you can just look them up in the `parts` array and modify them. Here's an example:

```js
const command = new FFmkek()
  .addInput('some/file.mp4')
  .setOutput('other/file.mp4')

// Currently our command yields:
// ffmpeg -i some/file.mp4 other/file.mp4

command.parts.find(part => part.name === 'some/file.mp4').addOption('-r', 1)

// Now our command looks like:
// ffmpeg -r 1 -i some/file.mp4 other/file.mp4
```

[Here's](https://github.com/TeeSeal/coub-dl/blob/master/src/Coub.js#L48) a real world usage for this.

### Part.prototype.setName(name)

Sets the name of the part.

**Params**:

* name: `string`

**Returns**: `Part` self.

### Part.prototype.setType(type)

Sets the type of the part. Can only be `input` or `output`. You can use the `Part.INPUT` and `Part.OUTPUT` constants instead.

**Params**:

* type: `string`

**Returns**: `Part` self.

### Part.prototype.addOption(name, [value1[, ...[, valueN]]])

Adds an option to the `Part`. Values are concatenated automatically.
Upon adding an option with the same name later on, the values are again concatenated, the option is not overwriten.

**Params**:

* name: `string`
  The name of the option. Does NOT prepend a hyphen automatically, you must add it yourself.
* valueN: `string`
  The set of values to set the option to.

**Returns**: `Part` self.

### Part.prototype.apply(args)

Pushes all its options and name to an array.

```js
new Part()
  .setName('some/file.mp4')
  .addOption('-c', 'copy')
  .addOption('-vf', 'scale=300:-2', 'crop=150:150:0:0')
  .apply([]) // => ['-c', 'copy', '-vf', 'scale=300:-2, crop=150:150:0:0', '-i', 'some/file.mp4']
```

**Params**:

* args: `Array`

**Returns**: `Array` The new array.

### Part.prototype.remove()

Removes self from parent FFmkek command.

**Returns**: `Part` self.


## Contributing

If there are things you don't agree with, or would like to have implemented, feel free to submit a pull request or file an issue.
