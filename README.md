# What is the Streams API ?

Streams API allows JavaScript to programmatically access streams of data received over the network or created by whatever means locally and process them with JavaScript.this Streams API introduce in ES6 and before that we never able to do this things!

> Just use `fetch` . technically possible to use with `XMLHttpRequest` but don't use that!

## Where we gonna use this ?

we can start processing raw data with JavaScript bit by bit
, as soon as it is available on the client, without needing to generate a buffer, string, or blob.

- Image decoding :piping an HTTP response stream through a transform stream that decodes bytes into bitmap data, and then through another transform stream that translates bitmaps into PNGs.
- Video effects: piping a readable video stream through a transform stream that applies effects in real time.

**streaming** : breaking a resource that you want to receive over a network down into small chunks (small pieces) _browser_ already break down the assets images and video to small pieces but if you want break down a js file you must use streams .
without streams if we wanted to process a resource of some kind (video, text file, etc.), we'd have to download the entire file, wait for it to be deserialized into a suitable format, then process all the data.

---

## But How?

### The Concept

before we continue , we need clearly describe some Concept and definition :

- **Chunks** : A chunk is a single piece of data that is written to or read from a stream. it can be any type or contain different types in a stream.

- **Readable Streams** :A readable stream represents a source of data from which you can read. In other words, data comes out of a readable stream. Concretely, a readable stream is an instance of the ReadableStream class.

- **Writable Streams** :A writable stream represents a destination for data into which you can write. In other words, data goes in to a writable stream. Concretely, a writable stream is an instance of the WritableStream class.

- **Readable Streams** :A transform stream consists of a pair of streams: a writable stream, known as its writable side, and a readable stream, known as its readable side.

- **Teeing (Lock)**:
  A readable stream can be teed (named after the shape of an uppercase 'T') using its `tee()` method. This will **lock** the stream, that is, make it no longer directly usable; however, it will create two new streams, called branches, which can be consumed independently. Teeing also is important because streams cannot be rewound or restarted, more about this later.

- **Pipe chains** :
  Streams are primarily used by piping them to each other. A `readable stream` can be piped directly to a writable stream, using the readable stream's `pipeTo()` method, or it can be piped through one or more transform streams first, using the readable stream's `pipeThrough()` method. A set of streams piped together in this way is referred to as a pipe chain.

- **Backpressure** :
  Once a pipe chain is constructed, it will propagate signals regarding how fast chunks should flow through it. If any step in the chain cannot yet accept chunks, it propagates a signal backwards through the pipe chain, until eventually the original source is told to stop producing chunks so fast. This process of normalizing flow is called backpressure.

---

## Readable Streams - part A

The `ReadableStream()` constructor creates and returns a readable stream object from the given handlers.There are two types of underlying source:

- **_Push sources_** constantly push data at you when you have accessed them, and it is up to you to start, pause, or cancel access to the stream. Examples include live video streams, server-sent events, or WebSockets.
- **_Pull sources_** require you to explicitly request data from them once connected to. Examples include HTTP operations via fetch() or XMLHttpRequest calls.

```js
// pass the  underlying source as an argument to constructor
// this is optional
const readableStream = new ReadableStream({
  //Called immediately when the object is constructed
  start(controller) {
    // this controller has three methods
    // 1 - controller.close()  to closes the associated stream.
    // 2 - controller.enqueue() to enqueues a given chunk in the associated stream.
    // 3 - controller.error() auses any future interactions with the associated stream to error.
  },

  // Can be used to control the stream as more chunks are fetched.
  // If the promise rejects, the stream will throw an errored.
  pull(controller) {
    /* … */
  },

  // Called when the stream consumer cancels the stream.
  cancel(reason) {
    /* … */
  },
})
```

> example :

```js
const readableStream = new ReadableStream({
  start(controller) {
    controller.enqueue('The first chunk!')
  },
})
```

## Readable Streams -part B

we talked bout the first optional argument the `underlyingSource`.
the seconde optional argument is `queuingStrategy`.
its an object has two parameters :

- `highWaterMark` : indicating the high water mark of the stream. it must be a positive number . highWaterMark>=0
- `size(chunk)` : this function computes and returns the finite non-negative size of the given chunk value

```js
const readableStream = new ReadableStream(
  {
    //the first optional arguments
  },
  {
    highWaterMark: 5,
    size(chunk) {
      return chunk.length
    },
  }
)
```

### What is the `getReader()` and `read()` ?

if you want to read from a readable stream You need a reader :) .
we make a reader with `readableStream.getReader()`

what about `read ()`?
returns a promise providing access to the next chunk in the stream's internal queue. It fulfills or rejects with a result depending on the state of the stream.

we have three conditions :

1 - If a chunk is available :`{ value: chunk, done: false }`
2 - If the stream becomes closed : `{ value: undefined, done: true }`
3 - If the stream becomes errored : the promise will be rejected !

```js
const reader = readableStream.getReader()
do {
  const { done, value } = await reader.read()
  if (done) {
    console.log('The stream is done.')
    break
  } else {
    console.log('the stream is going on we have more chunks')
  }
  console.log('Just read a chunk:', value)
} while (true)
```

### What about The locked property?

we can check the lock status of a readable stream with `ReadableStream.locked`

```js
if (ReadableStream.locked) {
  console.log(`sorry this stream is Locked .`)
} else {
  console.log(`You can easily change ! its not locked`)
}
```

## Readable Streams -part C

### How to Tee a `readable stream`?

what is tee?
we talked about it before ! read this article carefully...
if you remember the `tee()`tees the current readable stream and returning a two-element array containing the two resulting branches as new ReadableStream instances.
**_This allows two readers to read a stream simultaneously._**

---

## TODO writable stream

## TODO transform stream
