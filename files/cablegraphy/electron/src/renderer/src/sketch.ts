import p5 from 'p5'
import { Pane } from 'tweakpane'
import box from './box.json'
import circle from './circle.json'
import { params } from './gui'
import sin from './sin.json'
import { useDataStore } from './state'
import triangle from './triangle.json'
const OSC_MESSAGES = {
  STOP: '/stop'
} as const

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

  let boundsWidth = 0
  let boundsHeight = 0
  let isInside = false

  const m2Posx = 720
  let previousDiagonalInPixelM1 = 0
  let previousDiagonalInPixelM2 = m2Posx

  let isRecording = false
  let movements: Movement[] = []
  let playbackIndex = 0
  let isPlayingBack = false

  let circleCenterX1 = 0
  let circleCenterY1 = 0
  let circleCenterX2 = 0
  let circleCenterY2 = 0
  let circleCenterX3 = 0
  let circleCenterY3 = 0

  const pastPositions: Movement[] = [] // Array to store past positions

  const offset = 50

  const motorSize = 10

  let pane: Pane

  const microSteps = 32

  function calculateM1(currentX: number, currentY: number): number {
    // 70mm for 360 or 200 steps
    // 0.19mm per step
    const oneResolution = 200 / 58.87

    const diagonalPixel = Math.sqrt(Math.pow(currentX, 2) + Math.pow(currentY, 2))

    const physicalDiag = previousDiagonalInPixelM1 - diagonalPixel

    previousDiagonalInPixelM1 = diagonalPixel
    console.log('previousDiagonalInPixelM1', previousDiagonalInPixelM1)

    const motorSteps = physicalDiag * oneResolution * microSteps

    return motorSteps
  }

  function calculateM2(currentX: number, currentY: number): number {
    // const pixelPhysicalFactor = 500 / 775 // pixels to mm factor

    // because our width is 745

    // 70mm for 360 or 200 steps
    // 0.19mm per step

    // steps / mm JOHNNY APPROVED BY COOPERATE
    const oneResolution = 200 / 58.87

    const targetDiagonalInPixel = Math.sqrt(Math.pow(m2Posx - currentX, 2) + Math.pow(currentY, 2))
    const physicalDiag = targetDiagonalInPixel - previousDiagonalInPixelM2

    previousDiagonalInPixelM2 = targetDiagonalInPixel

    const motorSteps = physicalDiag * oneResolution * microSteps

    return motorSteps
  }

  p.setup = (): void => {
    const canvas = p.createCanvas(800, 1000)
    // canvas.addClass('w-[1000px] h-[1000px]')

    // Initialize the circle center to the middle of the canvas
    circleCenterX1 = 50
    circleCenterY1 = 50
    circleCenterX2 = 50
    circleCenterY2 = 50
    circleCenterX3 = 50
    circleCenterY3 = 50

    // Create the safety boundary rectangle
    boundsWidth = 745
    console.log('boundsWidth', boundsWidth)
    boundsHeight = boundsWidth

    // setupGui()
    // pane = setupTweakpane(params)
  }

  p.windowResized = (): void => {
    p.resizeCanvas(1000, 1000)
  }

  p.draw = (): void => {
    // we check if we need to stop the motors
    // Translate the origin to the bottom-left corner

    p.background(255)

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

      if (p.mouseIsPressed) {
        p.fill(255, 60)
        p.ellipse(p.mouseX, p.mouseY, 25, 25)
      }
    }

    // // Draw past positions
    // p.fill(200, 200, 255, 150) // Light blue with transparency
    // for (const pos of pastPositions) {
    //   p.ellipse(pos.x, pos.y, 10, 10) // Draw a small circle at each past position
    // }

    // // Update past positions
    // if (isPlayingBack && playbackIndex < movements.length) {
    //   const movement = movements[playbackIndex]
    //   circleCenterX1 = movement.x
    //   circleCenterY1 = movement.y
    //   playbackIndex++
    // } else if (playbackIndex >= movements.length) {
    //   isPlayingBack = false
    //   playbackIndex = 0
    // }

    // // Add current position to past positions
    // pastPositions.push({ x: circleCenterX1, y: circleCenterY1 })
    // console.log('pastPositions', pastPositions)

    // // Limit the number of past positions stored
    // if (pastPositions.length > 1000) {
    //   pastPositions.shift() // Remove the oldest position if the array is too long
    // }

    // Draw bounds
    p.noFill()
    p.stroke(250, 0, 250)
    p.rect(0 + offset, 0 + offset, boundsWidth, boundsHeight)

    // // this is drawing the rect for the motors
    p.rect(offset, offset - motorSize, motorSize, motorSize)
    // p.rect(firstRectX2, rectY, motorSize, motorSize)

    // 1st pair lines
    p.stroke(0)

    p.fill(0, 255, 0)

    p.ellipse(circleCenterX1, circleCenterY1, 50, 50)
    p.fill(255, 0, 0)
    p.ellipse(circleCenterX2, circleCenterY2, 50, 50)
    p.fill(0, 0, 255)
    p.ellipse(circleCenterX2, circleCenterY2, 50, 50)

    // Draw past positions on mouse click
    p.fill(200, 200, 255, 150) // Light blue with transparency
    for (const pos of pastPositions) {
      p.ellipse(pos.x, pos.y, 10, 10) // Draw a small circle at each past position
    }

    // p.ellipse(centerX, centerY, 50, 50)

    // Draw lines from the small rectangles to the circle
    p.stroke(0)

    // p.line(firstRectX1 + motorSize / 2, rectY + motorSize / 2, centerX, centerY)
    // p.line(firstRectX2 + motorSize / 2, rectY + motorSize / 2, centerX, centerY)
    // this is for the lines from the motors

    // p.line(50 + motorSize / 2, rectY + motorSize / 2, circleCenterX1, circleCenterY1)
    // p.line(500 + 50 - motorSize / 2, rectY + motorSize / 2, circleCenterX1, circleCenterY1)

    // Playback logic
    if (isPlayingBack && playbackIndex < movements.length) {
      const movement = movements[playbackIndex]
      circleCenterX1 = movement.x
      circleCenterY1 = movement.y
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

  async function handleKeyPress(dataSet: Movement[], delay: number): Promise<void> {
    let prevMotor1: number = 0
    let prevMotor2: number = 0
    let secondPrevMotor1: number = 0
    let secondPrevMotor2: number = 0

    let prevCoordX = 0
    let prevCoordY = 0
    let secondPrevCoordX = 0
    let secondPrevCoordY = 0

    pastPositions.length = 0

    for (let i = 0; i < dataSet.length; i++) {
      const coord = dataSet[i]

      pastPositions.push({ x: coord.x, y: coord.y })

      console.log('coord', coord)
      const motor1 = calculateM1(coord.x, coord.y)
      const motor2 = calculateM2(coord.x, coord.y)
      window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
      window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())
      if (prevMotor1 !== 0 || prevMotor2 !== 0) {
        circleCenterX2 = prevCoordX
        circleCenterY2 = prevCoordY
        window.electron.ipcRenderer.send('/step/3', prevMotor1.toFixed(0).toString())
        window.electron.ipcRenderer.send('/step/4', prevMotor2.toFixed(0).toString())
      }
      if (secondPrevMotor1 !== 0 || secondPrevMotor2 !== 0) {
        circleCenterX3 = secondPrevCoordX
        circleCenterY3 = secondPrevCoordY
        window.electron.ipcRenderer.send('/step/5', secondPrevMotor1.toFixed(0).toString())
        window.electron.ipcRenderer.send('/step/6', secondPrevMotor2.toFixed(0).toString())
      }

      circleCenterX1 = coord.x
      circleCenterY1 = coord.y

      // Update the second previous motors
      secondPrevMotor1 = prevMotor1
      secondPrevMotor2 = prevMotor2

      // Update second previous coordinates
      secondPrevCoordX = prevCoordX
      secondPrevCoordY = prevCoordY

      // Update the previous motors
      prevMotor1 = motor1
      prevMotor2 = motor2

      prevCoordX = coord.x
      prevCoordY = coord.y

      p.redraw() // Redraw the canvas to update the circle position

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  p.keyPressed = async (): Promise<void> => {
    // if (p.key === '0') {
    //   let prevCoord = { x: 0, y: 0 }
    //   pastPositions.length = 0
    //   for (const coord of ai) {
    //     pastPositions.push({ x: coord.x, y: coord.y })
    //     console.log('coord', coord)
    //     const motor1 = calculateM1(coord.x, coord.y)
    //     const motor2 = calculateM2(coord.x, coord.y)
    //     window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
    //     window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())
    //     if (prevCoord.x !== 0 || prevCoord.y !== 0) {
    //       const prevMotor1 = calculateM1(prevCoord.x, prevCoord.y)
    //       const prevMotor2 = calculateM2(prevCoord.x, prevCoord.y)
    //       window.electron.ipcRenderer.send('/step/3', prevMotor1.toFixed(0).toString())
    //       window.electron.ipcRenderer.send('/step/4', prevMotor2.toFixed(0).toString())
    //     }
    //     circleCenterX1 = coord.x
    //     circleCenterY1 = coord.y
    //     p.redraw() // Redraw the canvas to update the circle position
    //     await new Promise((resolve) => setTimeout(resolve, 100))
    //     prevCoord = coord
    //   }
    // }

    // if (p.key === '1') {
    //   let prevCoord = { x: 0, y: 0 }
    //   pastPositions.length = 0
    //   for (const coord of circle) {
    //     pastPositions.push({ x: coord.x, y: coord.y })
    //     console.log('coord', coord)
    //     const motor1 = calculateM1(coord.x, coord.y)
    //     const motor2 = calculateM2(coord.x, coord.y)
    //     window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
    //     window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())
    //     if (prevCoord.x !== 0 || prevCoord.y !== 0) {
    //       const prevMotor1 = calculateM1(prevCoord.x, prevCoord.y)
    //       const prevMotor2 = calculateM2(prevCoord.x, prevCoord.y)
    //       window.electron.ipcRenderer.send('/step/3', prevMotor1.toFixed(0).toString())
    //       window.electron.ipcRenderer.send('/step/4', prevMotor2.toFixed(0).toString())
    //     }
    //     circleCenterX1 = coord.x
    //     circleCenterY1 = coord.y
    //     p.redraw() // Redraw the canvas to update the circle position
    //     await new Promise((resolve) => setTimeout(resolve, 5000))
    //     prevCoord = coord
    //   }
    // }
    // if (p.key === '2') {
    //   let prevCoord = { x: 0, y: 0 }
    //   pastPositions.length = 0
    //   for (const coord of triangle) {
    //     pastPositions.push({ x: coord.x, y: coord.y })

    //     console.log('coord', coord)
    //     const motor1 = calculateM1(coord.x, coord.y)
    //     const motor2 = calculateM2(coord.x, coord.y)
    //     window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
    //     window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())

    //     if (prevCoord.x !== 0 || prevCoord.y !== 0) {
    //       const prevMotor1 = calculateM1(prevCoord.x, prevCoord.y)
    //       const prevMotor2 = calculateM2(prevCoord.x, prevCoord.y)
    //       window.electron.ipcRenderer.send('/step/3', prevMotor1.toFixed(0).toString())
    //       window.electron.ipcRenderer.send('/step/4', prevMotor2.toFixed(0).toString())
    //     }
    //     circleCenterX1 = coord.x
    //     circleCenterY1 = coord.y
    //     p.redraw() // Redraw the canvas to update the circle position
    //     await new Promise((resolve) => setTimeout(resolve, 5000))
    //     prevCoord = coord
    //   }
    // }

    // if (p.key === '3') {
    //   let prevMotor1: number = 0
    //   let prevMotor2: number = 0
    //   let secondPrevMotor1: number = 0
    //   let secondPrevMotor2: number = 0
    //   pastPositions.length = 0
    //   for (const coord of box) {
    //     pastPositions.push({ x: coord.x, y: coord.y })

    //     console.log('coord', coord)
    //     const motor1 = calculateM1(coord.x, coord.y)
    //     const motor2 = calculateM2(coord.x, coord.y)
    //     window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
    //     window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())
    //     if (prevMotor1 !== 0 || prevMotor2 !== 0) {
    //       window.electron.ipcRenderer.send('/step/3', prevMotor1.toFixed(0).toString())
    //       window.electron.ipcRenderer.send('/step/4', prevMotor2.toFixed(0).toString())
    //     }
    //     if (secondPrevMotor1 !== 0 || secondPrevMotor2 !== 0) {
    //       window.electron.ipcRenderer.send('/step/5', secondPrevMotor1.toFixed(0).toString())
    //       window.electron.ipcRenderer.send('/step/6', secondPrevMotor2.toFixed(0).toString())
    //     }

    //     circleCenterX1 = coord.x
    //     circleCenterY1 = coord.y
    //     p.redraw() // Redraw the canvas to update the circle position

    //     // Update the second previous motors
    //     secondPrevMotor1 = prevMotor1
    //     secondPrevMotor2 = prevMotor2

    //     // Update the previous motors

    //     prevMotor1 = motor1
    //     prevMotor2 = motor2
    //     await new Promise((resolve) => setTimeout(resolve, 5000))
    //   }
    // }
    const { data } = useDataStore.getState() // Access the data from Zustand

    if (p.key === '1') {
      handleKeyPress(circle, 5000)
    }

    if (p.key === '2') {
      handleKeyPress(triangle, 5000)
    }

    if (p.key === '3') {
      handleKeyPress(box, 5000)
    }
    if (p.key === '4') {
      console.log('data', data)
      handleKeyPress(data, 5000)
    }
    if (p.key === '5') {
      handleKeyPress(sin, 8000)
    }
  }

  p.mouseDragged = (): void => {}

  p.mousePressed = (): void => {
    console.log(p.pmouseX)
    // window.electron.ipcRenderer.send('/step/1', p.mouseX)
    if (isInside) {
      const motor1 = calculateM1(p.mouseX, p.mouseY)
      // const motor1 = 200
      const motor2 = calculateM2(p.mouseX, p.mouseY)

      window.electron.ipcRenderer.send('/step/1', motor1.toFixed(0).toString())
      window.electron.ipcRenderer.send('/step/2', motor2.toFixed(0).toString())

      setTimeout(() => {
        window.electron.ipcRenderer.send('/step/3', motor1.toFixed(0).toString())
        window.electron.ipcRenderer.send('/step/4', motor2.toFixed(0).toString())
      }, 2000)

      setTimeout(() => {
        window.electron.ipcRenderer.send('/step/5', motor1.toFixed(0).toString())
        window.electron.ipcRenderer.send('/step/6', motor2.toFixed(0).toString())
      }, 4000)

      circleCenterX1 = p.mouseX
      circleCenterY1 = p.mouseY

      movements = [] // Clear previous movements
      movements.push({ x: p.mouseX, y: p.mouseY })

      pastPositions.push({ x: p.mouseX, y: p.mouseY })
      console.log('pastPositions', pastPositions)
    }
  }

  p.mouseReleased = (): void => {
    if (isInside) {
      isRecording = false
      isPlayingBack = true
      playbackIndex = 0
    }
  }
}

export default sketch
