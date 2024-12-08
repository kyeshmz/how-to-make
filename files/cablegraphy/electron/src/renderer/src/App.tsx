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

  return (
    <div className="">
      <div ref={sketchRef} className="w-full"></div>
    </div>
  )
}

export default App
