//! simple example of ReadableStream and first argument
const readEl = document.querySelector('#read')
const resultEl = document.querySelector('#result')
const listEl = document.querySelector('ul')

class TimestampSource {
  #interval

  start(controller) {
    let counter = 0
    this.#interval = setInterval(() => {
      const string = new Date().toLocaleTimeString()
      // Add the string to the stream.
      controller.enqueue(string)
      counter++
      const li = document.createElement('li')
      li.textContent = `${counter} - Enqueued ${string}`
      listEl.appendChild(li)
    }, 1_000)

    // after 10 secondes we clear interval and end of streams!
    setTimeout(() => {
      clearInterval(this.#interval)
      // Close the stream after 10s.
      controller.close()
    }, 10_000)
  }

  cancel() {
    // This is called if the reader cancels.
    clearInterval(this.#interval)
  }
}

// this TimestampSource is the first optional arguments we talked about it !
const stream = new ReadableStream(new TimestampSource())

// this must be async
// cause : stream.getReader().read() method returns promise
async function concatStringStream(stream) {
  const reader = stream.getReader()
  let result = ''
  do {
    // we have two value done and value
    // done is true when the stream ended
    // in here after ten secondes
    const { done, value } = await reader.read()

    // after 10 seconde we close the streams so this result printed
    if (done) {
      return result
    }
    // every time we concat the new timestamp to last ones
    result += value
    //calculate the length of all string to here
    readEl.textContent = `Read ${result.length} characters so far`
    //log the last one

    console.log(`Most recently read chunk: ${value}`)
  } while (true)
}
//because its a promise when its done we print stream completed!
// when it gonna be completed? when we close the streams
// in here after 10 secondes
concatStringStream(stream).then(
  (result) =>
    (resultEl.textContent = `Stream complete :)
   ${result}`)
)

//^ ========================================================================
//! the Tee
const readableStream = new ReadableStream({
  start(controller) {
    // Called by constructor.
    console.log('[start]')
    controller.enqueue('a')
    controller.enqueue('b')
    controller.enqueue('c')
  },
  pull(controller) {
    // Called `read()` when the controller's queue is empty.
    console.log('[pull]')
    controller.enqueue('d')
    controller.close()
  },
  cancel(reason) {
    // Called when the stream is canceled.
    console.log('[cancel]', reason)
  },
})

// Create two `ReadableStream`s.
const [streamA, streamB] = readableStream.tee()

// Read streamA iteratively one by one. Typically, you
// would not do it this way, but you certainly can.
const readerA = streamA.getReader()
console.log('[A]', await readerA.read()) //=> {value: "a", done: false}
console.log('[A]', await readerA.read()) //=> {value: "b", done: false}
console.log('[A]', await readerA.read()) //=> {value: "c", done: false}
console.log('[A]', await readerA.read()) //=> {value: "d", done: false}
console.log('[A]', await readerA.read()) //=> {value: undefined, done: true}

// Read streamB in a loop. This is the more common way
// to read data from the stream.
const readerB = streamB.getReader()
while (true) {
  const result = await readerB.read()
  if (result.done) break
  console.log('[B]', result)
}
