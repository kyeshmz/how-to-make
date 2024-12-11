import p5 from 'p5'
import { useEffect, useRef } from 'react'
import sketch from './sketch'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const sketchRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const p5Instance = new p5(sketch, sketchRef.current!)

    return (): void => {
      p5Instance.remove()
    }
  }, [])

  return <div ref={sketchRef} className="h-screen m-0" id="canvas-parent"></div>
}

export default App
