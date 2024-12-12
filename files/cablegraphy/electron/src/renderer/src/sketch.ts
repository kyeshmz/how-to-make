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
import { params, setupTweakpane } from './gui'

const OSC_MESSAGES = {
  STOP: '/stop'
} as const

type OSC_MESSAGES_TYPE = (typeof OSC_MESSAGES)[keyof typeof OSC_MESSAGES]

interface Movement {
  x: number
  y: number
}

// 70mm for 360 or 200 steps
// 0.19mm per step
//

// the distance betwwen the motors is 775mm

const sketch = (p: p5): void => {
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
  let previousDiagonalInPixelM1 = 0
  let previousDiagonalInPixelM2 = 500

  let isRecording = false
  let movements: Movement[] = []
  let playbackIndex = 0
  let isPlayingBack = false

  let previousX = 250
  let previousY = 250

  let circleCenterX = 0
  let circleCenterY = 0

  const offset = 50

  // this is the cm in 78
  const motor1Length = 78

  const motorSize = 10
  const motorPairDistance = 300

  const m1Posx = 0
  const m1Posy = 0
  const m2Posx = 775
  const m2Posy = 0
  let pane: Pane

  function calculateM1(currentX: number, currentY: number): number {
    const pixelPhysicalFactor = 1 // pixels to mm factor

    // 70mm for 360 or 200 steps
    // 0.19mm per step
    const oneResolution = 200 / 58.87

    const diagonalPixel = Math.sqrt(Math.pow(currentX, 2) + Math.pow(currentY, 2))

    const delta = previousDiagonalInPixelM1 - diagonalPixel

    previousDiagonalInPixelM1 = diagonalPixel
    console.log('previousDiagonalInPixelM1', previousDiagonalInPixelM1)

    // const targetDiagonalInPixels = Math.sqrt(Math.pow(targetX, 2) + Math.pow(targetY, 2))

    const physicalDiag = delta * pixelPhysicalFactor

    // const physicalDiag = (currentDiagonalInPixels - targetDiagonalInPixels) * pixelPhysicalFactor

    const motorSteps = physicalDiag * oneResolution

    // const coeff = 6.44
    // const divisor = 0.3
    // const numerator = Math.sqrt(Math.pow(inputX - 50, 2) + Math.pow(inputY, 2))
    // const result = (numerator * coeff) / divisor

    return motorSteps
  }

  function calculateM2(currentX: number, currentY: number): number {
    // const pixelPhysicalFactor = 500 / 775 // pixels to mm factor

    // // 70mm for 360 or 200 steps
    // // 0.19mm per step
    // const oneResolution = 200 / 70

    // const currentDiagonalInPixels = Math.sqrt(Math.pow(previousX, 2) + Math.pow(previousY, 2))

    // const targetDiagonalInPixels = Math.sqrt(Math.pow(targetX, 2) + Math.pow(targetY, 2))

    // const physicalDiag = (currentDiagonalInPixels - targetDiagonalInPixels) * pixelPhysicalFactor

    // const motorSteps = physicalDiag * oneResolution

    // // const coeff = 6.44
    // // const divisor = 0.3
    // // const numerator = Math.sqrt(Math.pow(inputX - 50, 2) + Math.pow(inputY, 2))
    // // const result = (numerator * coeff) / divisor

    // return motorSteps

    const pixelPhysicalFactor = 1

    // 70mm for 360 or 200 steps
    // 0.19mm per step

    // steps / mm JOHNNY APPROVED BY COOPERATE
    const oneResolution = 200 / 58.87

    const targetDiagonalInPixel = Math.sqrt(Math.pow(m2Posx - currentX, 2) + Math.pow(currentY, 2))
    const delta = targetDiagonalInPixel - previousDiagonalInPixelM2

    previousDiagonalInPixelM2 = targetDiagonalInPixel
    // const targetDiagonalInPixels = Math.sqrt(Math.pow(targetX, 2) + Math.pow(targetY, 2))

    const physicalDiag = pixelPhysicalFactor * delta
    // const physicalDiag = (currentDiagonalInPixels - targetDiagonalInPixels) * pixelPhysicalFactor

    const motorSteps = physicalDiag * oneResolution

    // const coeff = 6.44
    // const divisor = 0.3
    // const numerator = Math.sqrt(Math.pow(inputX - 50, 2) + Math.pow(inputY, 2))
    // const result = (numerator * coeff) / divisor

    return motorSteps
  }

  const sendOscMessage = (address: string, ...args: any[]): void => {
    console.log('OSC Message:', address, args)
    // Implement your OSC sending logic here
  }

  p.setup = (): void => {
    const parentElement = document.getElementById('canvas-parent')
    // if (parentElement) {
    //   p.createCanvas(parentElement.offsetWidth, parentElement.offsetHeight)
    // } else {
    //   p.createCanvas(800, 1000) // Fallback size
    // }
    const canvas = p.createCanvas(1000, 1000)
    // canvas.addClass('border-2 border-black border-solid')

    // Initialize the circle center to the middle of the canvas
    circleCenterX = 50
    circleCenterY = 50

    // Create the safety boundary rectangle
    boundsWidth = 745
    console.log('boundsWidth', boundsWidth)
    boundsHeight = boundsWidth
    boundsX = p.width / 2 - boundsWidth / 2
    boundsY = p.height / 2 - boundsWidth / 3

    // setupGui()
    pane = setupTweakpane(params)
  }

  p.windowResized = (): void => {
    p.resizeCanvas(1000, 1000)
  }

  p.draw = (): void => {
    // we check if we need to stop the motors
    // Translate the origin to the bottom-left corner

    p.background(255)
    if (!params.enableMove) {
      sendOscMessage(OSC_MESSAGES.STOP)
    }
    if (params.motorPair1.record) {
      isRecording = true
      isPlayingBack = false
    }
    if (params.motorPair1.play) {
      isRecording = false
      isPlayingBack = true
      params.motorPair1.record = false
      pane.refresh()
    }

    if (params.reset) {
      window.electron.ipcRenderer.send('/reset')
    }

    if (isInside) {
      // sendOscMessage('/norm', -1, x, y)

      // Highlight bounds when mouse is inside
      p.fill(250, 0, 250, 80)
      p.rect(50, 50, boundsWidth, boundsHeight)

      p.fill(255, 0, 255)

      // circle
      p.ellipse(p.mouseX, p.mouseY, 10, 10)
      // line from first
      // p.line(p.mouseX, boundsY, p.mouseX, boundsY + boundsHeight)
      // p.line(boundsX, p.mouseY, boundsX + boundsWidth, p.mouseY)

      if (p.mouseIsPressed) {
        p.fill(255, 60)
        p.ellipse(p.mouseX, p.mouseY, 25, 25)
      }
    }

    // Draw bounds
    p.noFill()
    p.stroke(250, 0, 250)
    p.rect(0 + offset, 0 + offset, boundsWidth, boundsHeight)

    // Calculate the center of the bounds
    const boundsCenterX = boundsX + boundsWidth / 2 + 50
    // const boundsCenterX =

    // const firstRectX1 = boundsCenterX - params.motorPair1.distance / 2 - motorSize / 2
    const firstRectX1 = boundsX
    const firstRectX2 = boundsCenterX + params.motorPair1.distance / 2 - motorSize / 2
    const rectY = offset - motorSize

    // // this is drawing the rect for the motors
    p.rect(offset, offset - motorSize, motorSize, motorSize)
    // p.rect(firstRectX2, rectY, motorSize, motorSize)

    // 1st pair lines
    p.stroke(0)

    const centerX = p.width / 2
    const centerY = p.height / 2
    p.fill(0, 255, 0)

    p.ellipse(circleCenterX, circleCenterY, 50, 50)

    // p.ellipse(centerX, centerY, 50, 50)

    // Draw lines from the small rectangles to the circle
    p.stroke(0)

    // p.line(firstRectX1 + motorSize / 2, rectY + motorSize / 2, centerX, centerY)
    // p.line(firstRectX2 + motorSize / 2, rectY + motorSize / 2, centerX, centerY)
    // this is for the lines from the motors

    p.line(50 + motorSize / 2, rectY + motorSize / 2, circleCenterX, circleCenterY)
    p.line(500 + 50 - motorSize / 2, rectY + motorSize / 2, circleCenterX, circleCenterY)

    // Playback logic
    if (isPlayingBack && playbackIndex < movements.length) {
      const movement = movements[playbackIndex]
      circleCenterX = movement.x
      circleCenterY = movement.y
      playbackIndex++
    } else if (playbackIndex >= movements.length) {
      isPlayingBack = false
      playbackIndex = 0
    }
  }

  p.mouseMoved = (): void => {
    isInside =
      p.mouseX > offset &&
      p.mouseX < offset + boundsWidth &&
      p.mouseY > offset &&
      p.mouseY < offset + boundsHeight
  }

  p.mouseDragged = (): void => {
    if (isRecording && isInside) {
      recordMovement()
    }
  }

  p.mousePressed = (): void => {
    console.log(p.pmouseX)
    // window.electron.ipcRenderer.send('/step/1', p.mouseX)
    if (isInside) {
      const deltaX = p.mouseX - circleCenterX
      const deltaY = p.mouseY - circleCenterY

      // Convert pixel values to mm
      const mmX = deltaX // Assuming 1 pixel = 1 mm
      const mmY = deltaY // Assuming 1 pixel = 1 mm

      const distance = Math.sqrt(mmX * mmX + mmY * mmY)
      // const steps = Math.round(distance / 0.3) // Convert distance to steps
      // console.log('steps', steps)
      // console.log('steps', steps)

      const steps = ((p.mouseX - 50) * 0.15525) / 0.3

      // const motor1 = ((p.mouseX - 50) * 0.15525) / 0.3
      // const motor2 = ((500 - (p.mouseX - 50)) * 0.15525) / 0.3
      // console.log('steps', steps)

      // const motor1 = calculateM1(p.mouseX, p.mouseY)
      // const motor1DiagInPixels = Math.sqrt(Math.pow(p.mouseX, 2) + Math.pow(p.mouseY, 2))

      const motor1 = calculateM1(p.mouseX, p.mouseY)
      const motor2 = calculateM2(p.mouseX, p.mouseY)
      // const motor1 = 322
      // const motor2 = 0

      // const motor1 = -400
      // const motor2 = -400

      // const motor2 = calculateM1(p.mouseX, p.mouseY)
      // console.log('motor1DiagInPixels', motor1DiagInPixels)
      console.log('motor1', motor1)
      console.log('motor2', motor2)
      console.log('mouseX', p.mouseX)
      console.log('mouseY', p.mouseY)

      window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
      window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())

      circleCenterX = p.mouseX
      circleCenterY = p.mouseY
      previousX = p.mouseX
      previousY = p.mouseY

      movements = [] // Clear previous movements
      recordMovement()
    }
  }

  p.mouseReleased = (): void => {
    if (isInside) {
      isRecording = false
      isPlayingBack = true
      playbackIndex = 0
    }
  }

  function recordMovement(): void {
    // console.log('recordMovement', movements)
    movements.push({ x: p.mouseX, y: p.mouseY })
  }
}

export default sketch
