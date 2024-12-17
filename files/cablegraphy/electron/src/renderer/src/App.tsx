import OpenAI from 'openai'
import p5 from 'p5'
import { useEffect, useRef, useState } from 'react'
import { Button } from './components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './components/dialog'
import { Label } from './components/label'
import { RadioGroup, RadioGroupItem } from './components/radio-group'
import sketch from './sketch'
import { useDataStore } from './state'

function App(): JSX.Element {
  const sketchRef = useRef<HTMLDivElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [apiResponse, setApiResponse] = useState<null | string>('') // New state for storing API response

  const setData = useDataStore((state) => state.setData)

  const [selectedPromptType, setSelectedPromptType] = useState('prompt_sequence') // New state for radio group

  const seqPrompt = `Imagine a display window where three vibrant balls are set to perform a mesmerizing dance. These balls can move freely within a defined space of 700 pixels in width and 500 pixels in height. The movement of each ball is orchestrated through a series of precise coordinates, ensuring a captivating and dynamic performance. 
    
  Each coordinate represents a point in the 700x500 space where a ball will pause momentarily before continuing its journey.   
The choreography of these movements is designed to create an engaging visual spectacle, drawing the audience's attention to the fluidity and grace of the balls as they traverse their designated paths. The balls should not be in coordinates under 50 pixels from any edge of the space.
  The path of the balls should be in this format. [{"x": 396, "y": 54}, {"x": 537, "y": 54}, {"x": 600, "y": 376}, {"x": 600, "y": 592}, {"x": 602, "y": 744}, {"x": 398, "y": 700}]
`

  const individualPrompt = `Imagine a display window where three vibrant balls are set to perform a mesmerizing dance. These balls can move freely within a defined space of 700 pixels in width and 500 pixels in height. The movement of each ball is orchestrated through a series of precise coordinates, ensuring a captivating and dynamic performance. `

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  })

  const connect = async () => {
    if ('serial' in navigator) {
      console.log('Web Serial API is supported.')
    } else {
      console.log('Web Serial API is not supported.')
    }
  }

  useEffect(() => {
    // connect()
    const p5Instance = new p5(sketch, sketchRef.current!)

    return (): void => {
      p5Instance.remove()
    }
  }, [])

  const handleRadioChange = (promptType: string): void => {
    console.log('selectedPromptType', selectedPromptType)

    setSelectedPromptType(promptType) // Update state with selected radio value
  }

  const handleInputClick = (): void => {
    setInputValue('')
  }

  const handleButtonClick = async (): Promise<void> => {
    setIsButtonDisabled(true)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-2024-08-06',

        messages: [
          { role: 'system', content: seqPrompt },
          { role: 'user', content: inputValue }
        ],

        max_tokens: 2000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'coordinate_schema',
            schema: {
              type: 'object',
              properties: {
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' }
                    },
                    required: ['x', 'y']
                  }
                }
              },
              required: ['coordinates']
            }
          }
        }
      })

      const messageContent = response.choices[0].message.content

      console.log('API response:', messageContent)
      console.log('messageContent', JSON.parse(messageContent!)['coordinates'])
      setApiResponse(messageContent) //
      setData(JSON.parse(messageContent!)['coordinates'])
      const event = new KeyboardEvent('keydown', { key: '4' })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsButtonDisabled(false)
    }
  }

  return (
    <div className="h-screen m-0 flex justify-around gap-4">
      {/* <ThreeCanvas></ThreeCanvas> */}
      <div ref={sketchRef} id="canvas-parent" className="w-[800px] h-[1000px]"></div>

      <div className="flex flex-col items-center pt-12 gap-8 pr-6">
        <h1 className="font-bold text-2xl">Disc bot</h1>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Presets</CardTitle>

            <CardDescription>
              <p>Preset movements for the discs</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-6">
            <Button
              className="bg-blue-500 text-white disabled:bg-gray-400 w-full"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '3' })
                window.dispatchEvent(event)
              }}
            >
              Box
            </Button>
            <Button
              className="bg-blue-500 text-white disabled:bg-gray-400 w-full"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '1' })
                window.dispatchEvent(event)
              }}
            >
              Circles
            </Button>
            <Button
              className="bg-blue-500 text-white disabled:bg-gray-400 w-full"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '2' })
                window.dispatchEvent(event)
              }}
            >
              Triangles
            </Button>
            <Button
              className="bg-blue-500 text-white disabled:bg-gray-400 w-full"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '5' })
                window.dispatchEvent(event)
              }}
            >
              Sin
            </Button>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Make ChatGPT Move!</CardTitle>
            <CardDescription>
              <p> Write a theme for ChatGPT to move around with</p>
              <Dialog>
                <DialogTrigger className="underline font-bold">
                  The actual underlying prompt
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>System prompt</DialogTitle>
                    <DialogDescription className="prose p-4 ">
                      {seqPrompt.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RadioGroup
              defaultValue="prompt_sequence"
              // value={selectedPromptType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="prompt_sequence"
                  onClick={() => {
                    handleRadioChange('prompt_sequence')
                  }}
                  id="r1"
                />
                <Label htmlFor="r1">Sequenced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="prompt_individual"
                  onClick={() => {
                    handleRadioChange('prompt_individual')
                  }}
                  id="r2"
                />
                <Label htmlFor="r2">Individual</Label>
              </div>
            </RadioGroup>
            <input
              type="text"
              value={inputValue}
              onClick={handleInputClick}
              onChange={(e) => setInputValue(e.target.value)}
              className="mb-2 p-2 border w-full"
            />
            <button
              onClick={handleButtonClick}
              disabled={isButtonDisabled}
              className="p-2 bg-blue-500 text-white disabled:bg-gray-400 w-full"
            >
              Send Request
            </button>
            {apiResponse && <p className="mt-4 p-2 border">{apiResponse}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
