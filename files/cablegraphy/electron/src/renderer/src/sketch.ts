// import p5 from 'p5'

// const sketch = (p: p5): void => {
//   p.setup = (): void => {
//     p.createCanvas(400, 400)
//   }

//   p.draw = (): void => {
//     p.background(200)
//     p.fill(100)
//     p.ellipse(p.width / 2, p.height / 2, 50, 50)
//   }
// }

// export default sketch

import p5 from 'p5'
import { Pane } from 'tweakpane'

interface Params {
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
}

const sketch = (p: p5): void => {
  let pane: Pane

  const params: Params = {
    enableMove: false,
    position: { x: 50, y: 50 },
    bounds: { x: 50, y: 50 },
    size: { x: 0.5, y: 0.5 },
    velocity: 0.5,
    acceleration: 0.5
  }

  // OSC settings
  const host = '127.0.0.1'
  const portSend = 55555
  const portReceive = 55556

  // Canvas bounds
  let boundsX = 0
  let boundsY = 0
  let boundsWidth = 0
  let boundsHeight = 0
  let isInside = false

  const sendOscMessage = (address: string, ...args: any[]): void => {
    console.log('OSC Message:', address, args)
    // Implement your OSC sending logic here
  }

  const setupGui = (): void => {
    pane = new Pane({
      title: 'Koriobot Controller',
      expanded: true
    })

    // Motion Controls Folder
    const motionFolder = pane.addFolder({
      title: 'Motion Controls',
      expanded: true
    })

    motionFolder
      .addBinding(params, 'enableMove', {
        label: 'Enable Move'
      })
      .on('change', (ev) => {
        sendOscMessage('/move_vel', ev.value)
      })

    motionFolder
      .addBinding(params, 'position', {
        label: 'Position',
        x: { min: 0, max: 100 },
        y: { min: 0, max: 100 }
      })
      .on('change', (ev) => {
        sendOscMessage('/norm', -1, ev.value.x / 100, ev.value.y / 100)
      })

    motionFolder
      .addButton({
        title: 'Reset'
      })
      .on('click', () => {
        sendOscMessage('/reset')
      })

    motionFolder
      .addButton({
        title: 'Stop'
      })
      .on('click', () => {
        sendOscMessage('/stop')
      })

    // Bounds Controls Folder
    const boundsFolder = pane.addFolder({
      title: 'Bounds Controls',
      expanded: true
    })

    boundsFolder
      .addBinding(params, 'bounds', {
        label: 'Position',
        x: { min: 0, max: 100 },
        y: { min: 0, max: 100 }
      })
      .on('change', (ev) => {
        sendOscMessage('/bounds/pos', ev.value.x / 100, ev.value.y / 100)
      })

    boundsFolder
      .addBinding(params, 'size', {
        label: 'Size',
        x: { min: 0, max: 100 },
        y: { min: 0, max: 100 }
        // width: { min: 0, max: 1, step: 0.01 },
        // height: { min: 0, max: 1, step: 0.01 }
      })
      .on('change', (ev) => {
        if (ev.last) {
          sendOscMessage('/bounds/width', ev.value.width)
          sendOscMessage('/bounds/height', ev.value.height)
        }
        // if (ev.last) {
        //     const widthMsg = new Message('/bounds/width')
        //     widthMsg.append(ev.value.width)
        //     oscClient.send(widthMsg)
        //     const heightMsg = new Message('/bounds/height')
        //     heightMsg.append(ev.value.height)
        //     oscClient.send(heightMsg)
        //   }
      })

    // Limits Folder
    const limitsFolder = pane.addFolder({
      title: 'Limits',
      expanded: true
    })

    limitsFolder
      .addBinding(params, 'velocity', {
        min: 0,
        max: 1,
        step: 0.01
      })
      .on('change', (ev) => {
        sendOscMessage('/limits/velocity', ev.value)
      })

    limitsFolder
      .addBinding(params, 'acceleration', {
        min: 0,
        max: 1,
        step: 0.01
      })
      .on('change', (ev) => {
        sendOscMessage('/limits/acceleration', ev.value)
      })
  }

  p.setup = (): void => {
    p.createCanvas(800, 1000)

    // Create the safety boundary rectangle
    boundsWidth = p.width / 2
    boundsHeight = boundsWidth
    boundsX = p.width / 2 - boundsWidth / 2
    boundsY = p.height / 2 - boundsWidth / 3

    setupGui()
  }

  p.draw = (): void => {
    p.background(200)

    if (isInside) {
      const x = p.map(p.mouseX, boundsX, boundsX + boundsWidth, 0, 1)
      const y = p.map(p.mouseY, boundsY, boundsY + boundsHeight, 0, 1)
      sendOscMessage('/norm', -1, x, y)

      // Highlight bounds when mouse is inside
      p.fill(250, 0, 250, 80)
      p.rect(boundsX, boundsY, boundsWidth, boundsHeight)
      p.fill(255, 0, 255)
      p.ellipse(p.mouseX, p.mouseY, 10, 10)
      p.line(p.mouseX, boundsY, p.mouseX, boundsY + boundsHeight)
      p.line(boundsX, p.mouseY, boundsX + boundsWidth, p.mouseY)

      if (p.mouseIsPressed) {
        p.fill(255, 60)
        p.ellipse(p.mouseX, p.mouseY, 25, 25)
      }
    }

    // Draw bounds
    p.noFill()
    p.stroke(250, 0, 250)
    p.rect(boundsX, boundsY, boundsWidth, boundsHeight)
  }

  p.mouseMoved = (): void => {
    isInside =
      p.mouseX > boundsX &&
      p.mouseX < boundsX + boundsWidth &&
      p.mouseY > boundsY &&
      p.mouseY < boundsY + boundsHeight
  }

  p.mousePressed = (): void => {
    if (isInside) {
      sendOscMessage('/move_vel', true)
    }
  }

  p.mouseReleased = (): void => {
    if (isInside) {
      sendOscMessage('/move_vel', false)
    }
  }
}

export default sketch
