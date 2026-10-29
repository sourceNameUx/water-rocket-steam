import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, CanvasImage, Sequence, Track, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Heading, SceneWipe, blue, clamp, coral, ease, gold, ink, mint, paper} from '../../revision-v6/src/design';
import evidence from '../../revision-v6/narration/revision-plan.json';

const Note: React.FC<{children: React.ReactNode; light?: boolean}> = ({children, light}) => <div style={{position: 'absolute', left: 72, bottom: 38, maxWidth: 1120, fontFamily: 'Body', fontSize: 25, color: light ? ink : paper}}>{children}</div>;
const heights = [
  {label: 'Primera versión', height: 2, percent: 40},
  {label: 'Botella grande', height: 0.5, percent: 10},
  {label: 'Diseño final', height: 1, percent: 20},
];

const Launch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const released = frame >= (evidence.releaseBracket[1] - evidence.sourceIn) * fps;
  return <AbsoluteFill>
    <Backdrop/>
    <Heading top={88} width={680} size={88}>El lanzamiento final</Heading>
    <div style={{position: 'absolute', top: 345, left: 76, color: released ? mint : gold, fontFamily: 'Display', fontSize: 49}}>{released ? 'El despegue' : 'El diseño terminado'}</div>
    {released && <div style={{position: 'absolute', left: 75, top: 417, color: paper, fontFamily: 'Body', fontSize: 32}}>Altura estimada ≈ 1 m</div>}
    <div style={{position: 'absolute', right: 33, top: 0, width: 405, height: 720}}><Video src={staticFile('media/final-launch-v6.mp4')} muted objectFit="contain" style={{width: '100%', height: '100%'}}/></div>
    <Note>Grabación original · a velocidad real</Note>
    <SceneWipe/>
  </AbsoluteFill>;
};

const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light top={44} size={76} width={1140}>Tres versiones. Una meta.</Heading>
    <svg width="1160" height="482" viewBox="0 0 1160 482" style={{position: 'absolute', left: 60, top: 154}}>
      <text x="5" y="30" fontFamily="Body" fontSize="25" fill={ink}>Altura (m)</text>
      {[0, 1, 2, 3, 4, 5].map(value => <g key={value}>
        <line x1="110" x2="1080" y1={366 - value * 56} y2={366 - value * 56} stroke={value === 5 ? coral : '#D4D5CD'} strokeWidth={value === 5 ? 4 : 2} strokeDasharray={value === 5 ? '13 8' : undefined}/>
        <text x="71" y={374 - value * 56} fontFamily="Body" fontSize="25" fill={ink}>{value}</text>
      </g>)}
      <text x="881" y="65" fontFamily="Display" fontSize="32" fill={coral}>Meta ≥ 5 m</text>
      {heights.map((result, index) => {
        const height = result.height * 56 * interpolate(frame, [35 + index * 20, 75 + index * 20], [0, 1], {...clamp, easing: ease});
        const x = 210 + index * 316;
        return <g key={result.label}>
          <rect x={x} y={366 - height} width="135" height={height} rx="7" fill={[blue, coral, '#228D78'][index]}/>
          <text x={x + 67} y={346 - height} textAnchor="middle" fontFamily="Display" fontSize="44" fill={ink} stroke={paper} strokeWidth="7" paintOrder="stroke">≈ {result.height.toLocaleString('es')} m</text>
          <text x={x + 67} y="408" textAnchor="middle" fontFamily="Display" fontSize="29" fill={ink}>{result.label}</text>
          <text x={x + 67} y="451" textAnchor="middle" fontFamily="Body" fontSize="27" fill={ink}>{result.percent} % de la meta</text>
        </g>;
      })}
    </svg>
    <Note light>Alturas aproximadas · la primera versión subió más</Note>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const Quantities: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop/>
    <Heading top={52} size={86} width={1140}>Las cantidades que supuse</Heading>
    <div style={{position: 'absolute', left: 75, top: 170, fontFamily: 'Body', fontSize: 29, color: paper}}>Botella personal · un cuarto de vinagre · media caja de bicarbonato</div>
    <svg viewBox="0 0 270 390" width="250" height="362" style={{position: 'absolute', left: 80, top: 253}}>
      <defs><clipPath id="fill-bottle"><path d="M 92 12 H 177 V 65 Q 227 99 227 145 V 342 Q 227 373 194 373 H 75 Q 42 373 42 342 V 145 Q 42 99 92 65 Z"/></clipPath></defs>
      <path d="M 92 12 H 177 V 65 Q 227 99 227 145 V 342 Q 227 373 194 373 H 75 Q 42 373 42 342 V 145 Q 42 99 92 65 Z" fill="#FFFFFF14" stroke={paper} strokeWidth="5"/>
      <rect x="42" y={373 - interpolate(frame, [20, 75], [0, 82], clamp)} width="185" height="100" fill={mint} clipPath="url(#fill-bottle)"/>
      <text x="135" y="218" textAnchor="middle" fontFamily="Display" fontSize="39" fill={paper}>400 mL</text>
      <text x="135" y="346" textAnchor="middle" fontFamily="Display" fontSize="35" fill={ink}>¼</text>
    </svg>
    <div style={{position: 'absolute', left: 408, top: 267, fontFamily: 'Display', color: mint, fontSize: 60}}>≈ 100 mL de vinagre</div>
    <div style={{position: 'absolute', left: 411, top: 355, fontFamily: 'Body', color: paper, fontSize: 29}}>400 mL × ¼ = 100 mL</div>
    <div style={{position: 'absolute', left: 408, top: 448, fontFamily: 'Display', color: gold, fontSize: 56}}>≈ 25 g de bicarbonato</div>
    <div style={{position: 'absolute', left: 411, top: 533, fontFamily: 'Body', color: paper, fontSize: 29}}>Si la caja tenía 50 g, la mitad serían 25 g.</div>
    <Note>Valores supuestos · no confirmé los tamaños de los envases</Note>
    <SceneWipe/>
  </AbsoluteFill>;
};

const Analysis: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light top={58} size={76} width={1140}>Qué pudo afectar el vuelo</Heading>
    {['Más masa necesita más empuje', 'El espacio para el gas cambia la presión', 'Fugas, inclinación o roce con el soporte'].map((text, index) => <div key={text} style={{position: 'absolute', top: 245 + index * 111, left: 75, width: 790, fontFamily: 'Display', color: ink, fontSize: 34, opacity: interpolate(frame, [15 + index * 65, 32 + index * 65], [0, 1], clamp)}}>
      <span style={{color: [blue, coral, '#167D68'][index], marginRight: 18}}>0{index + 1}</span>{text}
    </div>)}
    <CanvasImage src={staticFile('design/final-003.jpg')} style={{position: 'absolute', left: 901, top: 208, width: 241, height: 417, objectFit: 'contain', border: '7px solid white', rotate: '3deg'}}/>
    <Note light>Son causas posibles · cambié varias cosas entre las pruebas</Note>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const Mass: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={52} size={91} width={1140}>Antes del despegue</Heading>
  <div style={{position: 'absolute', left: 76, top: 230, color: paper, fontFamily: 'Body', fontSize: 30}}>100 g de vinagre + 25 g de bicarbonato + 60 g del cohete seco</div>
  <div style={{position: 'absolute', left: 70, top: 324, color: gold, fontFamily: 'Display', fontSize: 115}}>≈ 185 g en total</div>
  <div style={{position: 'absolute', left: 77, top: 510, width: 1100, color: mint, fontFamily: 'Body', fontSize: 30}}>Sin contar el soporte · la masa baja al salir el contenido</div>
  <Note>Masa seca supuesta · rango de 165 a 230 g según los valores usados</Note>
  <SceneWipe/>
</AbsoluteFill>;

const Conclusion: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={52} size={94} width={1140}>Lo que cambiaría</Heading>
  <div style={{position: 'absolute', left: 77, top: 240, color: paper, fontFamily: 'Body', fontSize: 31}}>Mejor resultado / meta mínima</div>
  <div style={{position: 'absolute', left: 72, top: 292, color: gold, fontFamily: 'Display', fontSize: 115}}>2 m / 5 m</div>
  <div style={{position: 'absolute', left: 78, top: 442, color: mint, fontFamily: 'Display', fontSize: 49}}>40 % de la meta</div>
  <div style={{position: 'absolute', left: 738, top: 240, width: 465, color: paper, fontFamily: 'Display', fontSize: 33, lineHeight: 1.25}}>1. Empezar más liviano<br/><br/>2. Pesar y revisar el cierre<br/><br/>3. Probar un cambio a la vez</div>
  <Note>Santiago Cundumi Solis · proyecto STEAM</Note>
</AbsoluteFill>;

export const Results: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill><Track name="Spanish final launch and analysis">
    <Sequence name="Confirmed final launch" durationInFrames={16 * fps}><Launch/></Sequence>
    <Sequence name="Three height estimates" from={16 * fps} durationInFrames={16 * fps}><Chart/></Sequence>
    <Sequence name="Quantity assumptions" from={32 * fps} durationInFrames={16 * fps}><Quantities/></Sequence>
    <Sequence name="Performance factors" from={48 * fps} durationInFrames={14 * fps}><Analysis/></Sequence>
    <Sequence name="Loaded mass" from={62 * fps} durationInFrames={10 * fps}><Mass/></Sequence>
    <Sequence name="Conclusion" from={72 * fps} durationInFrames={14 * fps}><Conclusion/></Sequence>
  </Track></AbsoluteFill>;
};
