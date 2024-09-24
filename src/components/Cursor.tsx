
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

export default function BlurryCursor() {
    const mouse = useRef({x: 0, y: 0});
    const circle = useRef<HTMLDivElement| null>(null);
    const colors = [
        "#c32d27",
        "#f5c63f",
        "#457ec4",
        "#356fdb",
    ]

    
    

    const moveCircle = (x: number, y: number) => {
        gsap.set(circle.current, {x, y, xPercent: -50, yPercent: -50})
    }
    const [isActive, setIsActive] = useState(false);
    const size = isActive ? 400 : 30;

    useEffect( () => {

        const manageMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
        
            mouse.current = {
                x: clientX,
                y: clientY
            }
    
            moveCircle(mouse.current.x, mouse.current.y);
        }

        window.addEventListener("mousemove", manageMouseMove);
        return () => {
            window.removeEventListener("mousemove", manageMouseMove);
        }
    }, [])

    return (
        <div className='relative h-screen'>
                   {

[...Array(4)].map((_, i) => {

    return (

    <div 

        style={{

            backgroundColor: colors[i],

            width: size,

            height: size,

            filter: `blur(${isActive ? 20 : 2}px)`,

            transition: `transform ${(4 - i) * delay}s linear, height 0.3s ease-out, width 0.3s ease-out, filter 0.3s ease-out`

        }}

        className='top-0 left-0 fixed rounded-full mix-blend-difference' 

        key={i} 

        ref={ref => circles.current[i] = ref}

    />)

})

}
        </div>
    )
}