import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, CanvasImage, Interactive, Sequence, Track, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Heading, SceneWipe, blue, clamp, coral, ease, gold, ink, mint, paper} from './design';
import copy from './results-copy.json';
import plan from '../narration/results-plan.json';
import projectCopy from './copy.json';

const Note: React.FC<{children: React.ReactNode; light?: boolean}> = ({children, light = false}) => <div style={{position: 'absolute', left: 70, bottom: 39, fontFamily: 'Body', fontSize: 27, color: light ? ink : paper}}>{children}</div>;

const FinalFootage: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={80} width={680} size={94}>{copy.footage}</Heading>
  <div style={{position: 'absolute', left: 73, top: 315, fontFamily: 'Display', color: gold, fontSize: 104}}>≈ 1 m</div>
  <div style={{position: 'absolute', left: 76, top: 447, fontFamily: 'Body', color: paper, fontSize: 33}}>{copy.reported}</div>
  <div style={{position: 'absolute', left: 824, top: 0, width: 405, height: 720, overflow: 'hidden'}}>
    <Video src={staticFile('media/final-assembly.mp4')} muted objectFit="contain" style={{width: '100%', height: '100%'}}/>
  </div>
  <Note>{copy.assemblyLabel}</Note>
  <SceneWipe/>
</AbsoluteFill>;

const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light top={42} size={81}>{copy.chart}</Heading>
    <svg width="1160" height="482" viewBox="0 0 1160 482" style={{position: 'absolute', left: 60, top: 153}}>
      <text x="5" y="31" fontFamily="Body" fontSize="24" fill={ink}>{copy.height}</text>
      {[0, 1, 2, 3, 4, 5].map(value => <g key={value}>
        <line x1="110" x2="1080" y1={366 - value * 56} y2={366 - value * 56} stroke={value === 5 ? coral : '#D4D5CD'} strokeWidth={value === 5 ? 4 : 2} strokeDasharray={value === 5 ? '13 8' : undefined}/>
        <text x="71" y={374 - value * 56} fontFamily="Body" fontSize="25" fill={ink}>{value}</text>
      </g>)}
      <text x="868" y="65" fontFamily="Display" fontSize="31" fill={coral}>{copy.goal} ≥ 5 m</text>
      {plan.results.map((result, index) => {
        const height = result.heightMetres * 56 * interpolate(frame, [40 + index * 22, 80 + index * 22], [0, 1], {...clamp, easing: ease});
        const x = 210 + index * 316;
        return <g key={result.id}>
          <rect x={x} y={366 - height} width="135" height={height} rx="7" fill={[blue, coral, '#228D78'][index]}/>
          <text x={x + 67} y={346 - height} textAnchor="middle" fontFamily="Display" fontSize="43" fill={ink} stroke={paper} strokeWidth="7" paintOrder="stroke">≈ {String(result.heightMetres).replace('.', ',')} m</text>
          <text x={x + 67} y="408" textAnchor="middle" fontFamily="Display" fontSize="28" fill={ink}>{result.label}</text>
          <text x={x + 67} y="450" textAnchor="middle" fontFamily="Body" fontSize="27" fill={ink}>{result.goalPercent}% {copy.ofGoal}</text>
        </g>;
      })}
    </svg>
    <Note light>{copy.estimateNote}</Note>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const BottleAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop/>
    <Heading top={54} width={1140} size={75}>{copy.bottle}</Heading>
    <div style={{position: 'absolute', left: 73, top: 180, color: gold, fontFamily: 'Body', fontSize: 28}}>{copy.hypotheses}</div>
    {[{title: copy.mass, caption: copy.thrust, symbol: 'm ↑'}, {title: copy.space, caption: copy.pressure, symbol: 'ΔP ≈ ΔnRT / V'}].map((item, index) => <div key={item.title} style={{position: 'absolute', left: 73 + index * 594, top: 255, width: 540, height: 315,
      borderTop: `7px solid ${index ? mint : gold}`, background: '#FFFFFF10', borderRadius: 14, padding: 26, boxSizing: 'border-box',
      opacity: interpolate(frame, [12 + index * 170, 29 + index * 170], [0, 1], clamp)}}>
      <div style={{fontFamily: 'Display', fontSize: 37, color: paper}}>{item.title}</div>
      <div style={{fontFamily: 'Display', fontSize: index ? 47 : 73, color: index ? mint : gold, marginTop: 28}}>{item.symbol}</div>
      <div style={{fontFamily: 'Body', fontSize: 28, color: paper, marginTop: 23}}>{item.caption}</div>
    </div>)}
    <Note>{copy.condition}</Note>
    <SceneWipe/>
  </AbsoluteFill>;
};

const DesignAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light top={56} width={1170} size={69}>{copy.design}</Heading>
    <div style={{position: 'absolute', left: 74, top: 181, fontFamily: 'Body', color: blue, fontSize: 29}}>{copy.hypotheses}</div>
    {copy.designFactors.map((text, index) => <div key={text} style={{position: 'absolute', left: 76, top: 271 + index * 110, display: 'flex', alignItems: 'center', gap: 21,
      opacity: interpolate(frame, [15 + index * 75, 32 + index * 75], [0, 1], clamp)}}>
      <span style={{width: 41, height: 41, background: [coral, gold, mint][index], borderRadius: '50%'}}/>
      <span style={{fontFamily: 'Display', color: ink, fontSize: 39}}>{text}</span>
    </div>)}
    <CanvasImage src={staticFile('design/final-003.jpg')} style={{position: 'absolute', left: 867, top: 194, width: 236, height: 446, objectFit: 'contain', border: '7px solid white', borderRadius: 12, rotate: '3deg'}}/>
    <Note light>{copy.noProof}</Note>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const Limits: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={56} width={1130} size={73}>{copy.limits}</Heading>
  <div style={{position: 'absolute', left: 74, top: 267, width: 1120, fontFamily: 'Display', color: paper, fontSize: 43, lineHeight: 1.3}}>{copy.missing}</div>
  <div style={{position: 'absolute', left: 74, top: 418, fontFamily: 'Display', color: gold, fontSize: 56}}>{copy.example}</div>
  <Note>{copy.noProof}</Note>
  <SceneWipe/>
</AbsoluteFill>;

const Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop/>
    <Heading top={52} width={1080} size={85}>{copy.conclusion}</Heading>
    <div style={{position: 'absolute', left: 77, top: 232, color: paper, fontFamily: 'Body', fontSize: 32}}>{copy.best}</div>
    <div style={{position: 'absolute', left: 73, top: 280, color: gold, fontFamily: 'Display', fontSize: 113}}>2 m / 5 m</div>
    <div style={{position: 'absolute', left: 78, top: 428, color: mint, fontFamily: 'Display', fontSize: 53}}>40% {copy.ofGoal}</div>
    <div style={{position: 'absolute', left: 750, top: 245, width: 435}}>{copy.next.map((text, index) => <div key={text} style={{fontFamily: 'Display', color: paper, fontSize: 40, lineHeight: 1.12, marginBottom: 38,
      opacity: interpolate(frame, [140 + index * 27, 158 + index * 27], [0, 1], clamp)}}>{index + 1}. {text}</div>)}</div>
    <Note>{projectCopy.name} · STEAM</Note>
  </AbsoluteFill>;
};

const ResultsInner: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill><Track name="Results and analysis">
    <Sequence name="Final recording / assembly excerpts" durationInFrames={10 * fps}><FinalFootage/></Sequence>
    <Sequence name="Reported heights / five-metre goal" from={10 * fps} durationInFrames={16 * fps}><Chart/></Sequence>
    <Sequence name="Larger bottle / conditional mass and pressure explanation" from={26 * fps} durationInFrames={16 * fps}><BottleAnalysis/></Sequence>
    <Sequence name="Finished design / possible limiting factors" from={42 * fps} durationInFrames={16 * fps}><DesignAnalysis/></Sequence>
    <Sequence name="Evidence limitations / ideal-model distinction" from={58 * fps} durationInFrames={12 * fps}><Limits/></Sequence>
    <Sequence name="Conclusion / measurement and repeated trials" from={70 * fps} durationInFrames={16 * fps}><Conclusion/></Sequence>
  </Track></AbsoluteFill>;
};

export const Results = Interactive.create({Component: ResultsInner, layout: 'absolute-fill', schema: {}});
