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
new FFmpeg()
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

## Documentation

### FFmkek.prototype.addInput(input)

Adds a new input to the command.

**Params**:

* input: `string|Stream`
  The path to the input file or a readable stream.

**Returns**: `FFmkek`
The current command.

## FFmkek.prototype.addOutput(output)

Adds a new output to the command.

**Params**:

* output: `string|Stream`
  The path to the ouput file or a writeable stream.

**Returns**: `FFmkek`
The current command.

## FFmkek.prototype.addOption(name, [value1[, ...[, valueN]]])

Add an option to the command. Values are concatenated automatically.

**Params**:

* name: `string`
  The name of the option. Does NOT prepend a hyphen automatically, you must add it yourself.
* valueN: `string`
  The set of values to set the option to.

**Returns**: `FFmkek`
The current command.

## FFmkek.prototype.setForce(flag)

Controls wether to add the `-y` option to the command or not. By default is set to true.

**Params**:

* flag: `boolean`

**Returns**: `FFmkek`
The current command.

## FFmkek.prototype.getArguments()

Formats the command arguments and returns them as an array.

**Returns**: `Array<string>`
The current command arguments.

## FFmkek.prototype.run()

Executes the current command. If no output is set, creates a `PassThrough` stream.

**Returns**: `Promise<string|Stream>`
The path of the file or the Stream that was written to.

## FFmkek.prototype.write(output)

Shorthand for calling `setOutput()` and `run()`.

**Params**:

* output: `string|Stream`
  The path to the ouput file or a writeable stream.

**Returns**: `FFmkek`
The current command.

## Contributing

If there are things you don't agree with, or would like to have implemented, feel free to submit a pull request or file an issue.
