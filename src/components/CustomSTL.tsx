
import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from 'react';

import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
// import { Box } from './model';

{/*  */}

// const Model = ({ url } : { url : string}) => {

//   const scene = useLoader(STLLoader, url)
//   return <mesh geometry={scene}>
//   <meshStandardMaterial color="hotpink" />
// </mesh>
//   // return <primitive object={scene} />
// };

export const Model = ({url}) => {
  const geom = useLoader(STLLoader, url);

  console.log(geom);

  const ref = useRef();
  const {camera} = useThree();
  useEffect(() => {
      camera.lookAt(ref.current.position);
  });

  return (
      <>
          <mesh ref={ref} >
              <primitive object={geom} attach="geometry"/>
              <meshPhongMaterial attach={"material"} shininess={30} color={"#049ef4"}  />

          </mesh>
          <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      </>
  );
};




const CustomSTL = ({url}:{url:string}) => {
  return (
    <div className='w-full h-[400px]'>
      <Canvas camera={{ position: [0, 10, 100] }} shadows>
          <Suspense fallback={null}>
               <Model url={url} />
          </Suspense>
     
      <Environment background backgroundBlurriness={1} backgroundIntensity={0.1}  preset={'dawn'} />

          <OrbitControls autoRotate autoRotateSpeed={4}   minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} />
         

         
     </Canvas>
    </div>
  )
}
export default CustomSTL