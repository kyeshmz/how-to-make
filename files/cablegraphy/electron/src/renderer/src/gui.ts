import { Pane } from 'tweakpane'

export interface Params {
  host: string
  reset: boolean
  portSend: number
  enableMove: boolean
  position: {
    x: number
    y: number
  }
  bounds: {
    x: number
    y: number
  }
  size: {
    x: number
    y: number
  }
  velocity: number
  acceleration: number
  motorPair1: {
    distance: number

    speed: number
    record: boolean
    play: boolean
  }
}

export const params: Params = {
  host: '127.0.0.1',
  reset: false,
  enableMove: true,
  portSend: 55555,
  position: { x: 50, y: 50 },
  bounds: { x: 50, y: 50 },
  size: { x: 0.5, y: 0.5 },
  velocity: 0.5,
  acceleration: 0.5,
  motorPair1: { distance: 78, speed: 0, record: false, play: false }
}

export function setupTweakpane(params: Params): Pane {
  const pane = new Pane({
    title: 'Controller',
    expanded: true
  })

  setupMotionFolder(pane, params)
  setupNetworkFolder(pane, params)
  setupMotor1Folder(pane, params)
  return pane
}

export function setupMotionFolder(pane: Pane, params: Params): void {
  const motionFolder = pane.addFolder({
    title: 'Motion Controls',
    expanded: true
  })

  motionFolder
    .addBinding(params, 'reset', {
      label: 'Reset'
    })
    .on('change', (ev) => {
      params.reset = ev.value
    })

  motionFolder
    .addBinding(params, 'enableMove', {
      label: 'Enable Move'
    })
    .on('change', (ev) => {
      params.enableMove = ev.value
      console.log('enableMove', params.enableMove)
      // sendOscMessage('/move_vel', ev.value)
    })
}

export function setupNetworkFolder(pane: Pane, params: Params): void {
  const networkFolder = pane.addFolder({
    title: 'Network Controls',
    expanded: true
  })

  networkFolder.addBinding(params, 'host', {
    label: 'Host'
  })
  networkFolder.addBinding(params, 'portSend', {
    label: 'Port Send'
  })
}

export function setupMotor1Folder(pane: Pane, params: Params): void {
  const motor1Folder = pane.addFolder({
    title: 'Motor Pair 1',
    expanded: true
  })

  motor1Folder.addBinding(params.motorPair1, 'distance', {
    label: 'Motor 1 Length'
  })
  motor1Folder.addBinding(params.motorPair1, 'speed', {
    label: 'Motor 1 Pair Speed'
  })
  motor1Folder.addBinding(params.motorPair1, 'record', {
    label: 'Record'
  })
  motor1Folder.addBinding(params.motorPair1, 'play', {
    label: 'Play'
  })
}

// const setupGui = (): void => {
//   pane = new Pane({
//     title: 'Koriobot Controller',
//     expanded: true
//   })

//   // Motion Controls Folder
//   const motionFolder = pane.addFolder({
//     title: 'Motion Controls',
//     expanded: true
//   })

//   motionFolder
//     .addBinding(params, 'enableMove', {
//       label: 'Enable Move'
//     })
//     .on('change', (ev) => {
//       sendOscMessage('/move_vel', ev.value)
//     })

//   motionFolder
//     .addBinding(params, 'position', {
//       label: 'Position',
//       x: { min: 0, max: 100 },
//       y: { min: 0, max: 100 }
//     })
//     .on('change', (ev) => {
//       sendOscMessage('/norm', -1, ev.value.x / 100, ev.value.y / 100)
//     })

//   motionFolder
//     .addButton({
//       title: 'Reset'
//     })
//     .on('click', () => {
//       sendOscMessage('/reset')
//     })

//   motionFolder
//     .addButton({
//       title: 'Stop'
//     })
//     .on('click', () => {
//       sendOscMessage('/stop')
//     })

//   // Bounds Controls Folder
//   const boundsFolder = pane.addFolder({
//     title: 'Bounds Controls',
//     expanded: true
//   })

//   boundsFolder
//     .addBinding(params, 'bounds', {
//       label: 'Position',
//       x: { min: 0, max: 100 },
//       y: { min: 0, max: 100 }
//     })
//     .on('change', (ev) => {
//       sendOscMessage('/bounds/pos', ev.value.x / 100, ev.value.y / 100)
//     })

//   boundsFolder
//     .addBinding(params, 'size', {
//       label: 'Size',
//       x: { min: 0, max: 100 },
//       y: { min: 0, max: 100 }
//       // width: { min: 0, max: 1, step: 0.01 },
//       // height: { min: 0, max: 1, step: 0.01 }
//     })
//     .on('change', (ev) => {
//       if (ev.last) {
//         sendOscMessage('/bounds/width', ev.value.width)
//         sendOscMessage('/bounds/height', ev.value.height)
//       }
//       // if (ev.last) {
//       //     const widthMsg = new Message('/bounds/width')
//       //     widthMsg.append(ev.value.width)
//       //     oscClient.send(widthMsg)
//       //     const heightMsg = new Message('/bounds/height')
//       //     heightMsg.append(ev.value.height)
//       //     oscClient.send(heightMsg)
//       //   }
//     })

//   // Limits Folder
//   const limitsFolder = pane.addFolder({
//     title: 'Limits',
//     expanded: true
//   })

//   limitsFolder
//     .addBinding(params, 'velocity', {
//       min: 0,
//       max: 1,
//       step: 0.01
//     })
//     .on('change', (ev) => {
//       sendOscMessage('/limits/velocity', ev.value)
//     })

//   limitsFolder
//     .addBinding(params, 'acceleration', {
//       min: 0,
//       max: 1,
//       step: 0.01
//     })
//     .on('change', (ev) => {
//       sendOscMessage('/limits/acceleration', ev.value)
//     })
// }
