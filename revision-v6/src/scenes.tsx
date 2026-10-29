import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, CanvasImage, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, BottleModel, Heading, Molecule, Photo, SceneWipe, blue, clamp, coral, ease, gold, ink, mint, paper} from './design';
import rawCopy from './copy.json';
import rawEdit from './edit.json';
import introCopy from './intro-copy.json';
import resultsCopy from './results-copy.json';

type Copy = Record<string, any>;
const copy = rawCopy as Copy;
export type Shot = {id: string; kind: string; from: number; frames: number; source?: string; attempt?: number; stage?: number; original?: boolean; replay?: boolean; trim?: number; speed?: number};
const media = rawEdit.media as Record<string, {src: string; landscape: boolean; sourceIn: number; duration: number}>;

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const words = copy.opening.title.split(' ');
  return <AbsoluteFill>
    <Backdrop accent={gold}/>
    <div style={{position: 'absolute', left: 692, top: 97, width: 530, height: 530, borderRadius: '50%', background: gold,
      scale: interpolate(frame, [3, 26], [0.25, 1], {...clamp, easing: ease})}}/>
    <div style={{position: 'absolute', left: 64, top: 123, width: 705, fontFamily: 'Display', fontSize: 126, lineHeight: 0.94, letterSpacing: -6, color: paper}}>
      {words.map((word: string, i: number) => <div key={word} style={{color: i ? gold : paper,
        translate: `${interpolate(frame, [4 + i * 9, 23 + i * 9], [-170, 0], {...clamp, easing: ease})}px 0px`,
        opacity: interpolate(frame, [4 + i * 9, 12 + i * 9], [0, 1], clamp)}}>{word}</div>)}
    </div>
    <div style={{position: 'absolute', left: 69, top: 415, width: 600, color: paper, fontFamily: 'Display', fontSize: 37,
      opacity: interpolate(frame, [38, 48], [0, 1], clamp)}}>{copy.opening.tagline}</div>
    <div style={{position: 'absolute', left: 68, bottom: 89, color: paper, fontFamily: 'Body', fontSize: 29,
      opacity: interpolate(frame, [12, 22], [0, 1], clamp)}}>{copy.name}</div>
    <div style={{position: 'absolute', left: 817, top: 54,
      rotate: `${interpolate(frame, [0, 40, 180, 209], [20, -13, -13, -25], {...clamp, easing: ease})}deg`,
      translate: `0px ${interpolate(frame, [0, 35, 179, 209], [170, 0, 0, -520], {...clamp, easing: ease})}px`,
      opacity: interpolate(frame, [5, 16], [0, 1], clamp)}}>
      <BottleModel id="hero" rocket liquid={0.15} pressure={0.3} style={{height: 590, width: 305}}/>
    </div>
  </AbsoluteFill>;
};

const ReagentVessel: React.FC<{id: string; powder?: boolean; frame: number}> = ({id, powder, frame}) => <svg viewBox="0 0 220 290" width="220" height="290">
  <defs>
    <linearGradient id={`${id}-surface`}><stop stopColor="#aee1d0" stopOpacity="0.35"/><stop offset="0.2" stopColor="#fff" stopOpacity="0.42"/><stop offset="0.4" stopColor="#8fbca8" stopOpacity="0.15"/><stop offset="1" stopColor="#2e6256" stopOpacity="0.5"/></linearGradient>
    <linearGradient id={`${id}-substance`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={powder ? '#fffbed' : '#eac495'}/><stop offset="1" stopColor={powder ? '#959d85' : '#886045'}/></linearGradient>
    <clipPath id={`${id}-vessel`}><path d="M 57 35 L 164 35 L 173 241 Q 174 261 150 264 L 70 264 Q 46 261 47 241 Z"/></clipPath>
  </defs>
  <ellipse cx="111" cy="272" rx="77" ry="10" fill="#000" opacity="0.2"/>
  <g clipPath={`url(#${id}-vessel)`}>
    <path d={powder ? 'M 30 220 Q 68 147 109 187 Q 146 180 187 226 L 188 270 L 30 270Z' : `M 32 158 Q 96 ${151 + Math.sin(frame / 18) * 3} 132 159 T 192 160 L 192 270 L 32 270Z`} fill={`url(#${id}-substance)`} opacity="0.9"/>
    {powder && Array.from({length: 35}, (_, i) => <circle key={i} cx={58 + i * 37 % 108} cy={197 + i * 19 % 58} r="1.1" fill="#fff" opacity="0.5"/>)}
  </g>
  <path d="M 57 35 L 164 35 L 173 241 Q 174 261 150 264 L 70 264 Q 46 261 47 241 Z" fill={`url(#${id}-surface)`} stroke="#cff2da" strokeOpacity="0.6" strokeWidth="1.3"/>
  <ellipse cx="111" cy="35" rx="54" ry="8" fill="#729783" fillOpacity="0.2" stroke="#d7ebda" strokeWidth="2"/>
  <path d="M 68 49 L 62 235" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.27"/>
  {[90, 123, 156, 189, 222].map(y => <path key={y} d={`M 144 ${y} l 13 0`} stroke="#bfcfc2" strokeWidth="1.3" opacity="0.5"/>)}
</svg>;

export const Chemistry: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = interpolate(frame, [135, 195], [0, 1], {...clamp, easing: ease});
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light width={1120} size={70}>{copy.chemistry.title}</Heading>
    <div style={{position: 'absolute', top: 250, left: 112, opacity: 1 - phase,
      translate: `${-phase * 150}px 0px`, scale: 1 - phase * 0.16}}>
      <ReagentVessel id="acid" frame={frame}/>
      <div style={{width: 220, textAlign: 'center', fontFamily: 'Display', fontSize: 34, color: ink}}>{copy.ingredients?.[0]}</div>
      <div style={{width: 220, textAlign: 'center', fontFamily: 'Body', fontSize: 25, color: blue, marginTop: 8}}>CH₃COOH</div>
    </div>
    <div style={{position: 'absolute', left: 413, top: 320, fontSize: 103, color: coral, fontFamily: 'Display', opacity: 1 - phase}}>+</div>
    <div style={{position: 'absolute', top: 250, left: 533, opacity: 1 - phase,
      translate: `${-phase * 90}px 0px`, scale: 1 - phase * 0.16}}>
      <ReagentVessel id="base" powder frame={frame}/>
      <div style={{width: 335, marginLeft: -57, textAlign: 'center', fontFamily: 'Display', fontSize: 32, color: ink}}>{copy.ingredients?.[1]}</div>
      <div style={{width: 220, textAlign: 'center', fontFamily: 'Body', fontSize: 25, color: blue, marginTop: 8}}>NaHCO₃</div>
    </div>
    <div style={{position: 'absolute', left: 849, top: 261, opacity: 1 - phase,
      translate: `0px ${Math.sin(frame / 25) * 7}px`}}><BottleModel id="reaction-preview" liquid={0.38} pressure={0.75} style={{width: 155, height: 300}}/></div>
    <div style={{position: 'absolute', left: 789, top: 345, color: coral, fontFamily: 'Display', fontSize: 61, opacity: 1 - phase}}>→</div>
    <div style={{position: 'absolute', left: 65, top: 274, opacity: phase,
      translate: `${interpolate(frame, [153, 197], [-60, 0], {...clamp, easing: ease})}px 0px`}}>
      <div style={{fontFamily: 'Display', fontSize: 158, letterSpacing: -6, lineHeight: 1, color: blue}}>CO₂</div>
      <div style={{width: 440, color: ink, fontFamily: 'Display', fontSize: 40, lineHeight: 1.12, marginTop: 17}}>{copy.gas}</div>
    </div>
    <div style={{position: 'absolute', left: 547, top: 226, opacity: phase,
      scale: interpolate(frame, [145, 240, 539], [0.3, 1.05, 1.0], {...clamp, easing: ease})}}><Molecule progress={phase}/></div>
    <div style={{position: 'absolute', bottom: 47, left: 67, fontFamily: 'Body', fontSize: 30, color: ink,
      opacity: interpolate(frame, [240, 270], [0, 1], clamp)}}>CH₃COOH + NaHCO₃ <span style={{color: coral}}>→</span> CH₃COONa + H₂O + <span style={{color: coral}}>CO₂</span></div>
    <SceneWipe light/>
  </AbsoluteFill>;
};

export const Physics: React.FC = () => {
  const frame = useCurrentFrame();
  const release = interpolate(frame, [215, 355], [0, 1], {...clamp, easing: ease});
  const pressure = interpolate(frame, [10, 170], [0.05, 1], clamp);
  const jet = interpolate(frame, [194, 225, 400, 470], [0, 1, 1, 0.45], clamp);
  return <AbsoluteFill>
    <Backdrop/>
    <Heading width={560} size={72}>{copy.physics.title}</Heading>
    <div style={{position: 'absolute', left: 69, top: 337, width: 335}}>
      {[copy.pressure, copy.water, copy.reaction].map((label: string, i: number) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 27,
        opacity: interpolate(frame, [20 + i * 75, 44 + i * 75], [0, 1], clamp),
        translate: `${interpolate(frame, [20 + i * 75, 57 + i * 75], [30, 0], {...clamp, easing: ease})}px 0px`}}>
        <div style={{width: 13, height: 35, borderRadius: 6, background: i === 2 ? gold : mint}}/>
        <div style={{fontFamily: 'Display', fontSize: 43, color: i === 2 ? gold : paper}}>{label}</div>
      </div>)}
    </div>
    <svg width="610" height="600" style={{position: 'absolute', left: 573, top: 85}}>
      <defs><linearGradient id="jet" x1="0" y1="0" x2="0" y2="1"><stop stopColor={mint} stopOpacity="0.9"/><stop offset="1" stopColor={mint} stopOpacity="0"/></linearGradient></defs>
      <path d={`M 296 ${451 - release * 88} Q 277 519 252 584 L 381 584 Q 354 520 331 ${451 - release * 88} Z`} fill="url(#jet)" opacity={jet * 0.9}/>
      {Array.from({length: 28}, (_, i) => {
        const flow = (frame * 0.028 + i * 0.111) % 1;
        return <ellipse key={i} cx={315 + Math.sin(i * 5.3) * (5 + flow * 34)} cy={451 - release * 88 + flow * 197} rx={1.5 + flow * 2.4} ry={4 + flow * 12} fill={mint} opacity={jet * (1 - flow) * 0.9}/>;
      })}
      <g opacity={jet}>
        <path d="M 486 492 L 486 294 L 458 321 L 451 314 L 493 270 L 535 314 L 527 321 L 501 294 L 501 492 Z" fill={coral}/>
        <path d="M 102 347 L 102 541 L 77 514 L 69 522 L 109 565 L 149 522 L 141 514 L 117 541 L 117 347 Z" fill={mint} opacity="0.66"/>
      </g>
    </svg>
    <div style={{position: 'absolute', left: 738, top: 84 - release * 88,
      rotate: `${Math.sin(frame / 21) * pressure * (1 - release) * 0.6}deg`}}>
      <BottleModel id="physics-bottle" liquid={0.5 - release * 0.35} pressure={pressure} explode={release} style={{width: 300, height: 580}}/>
    </div>
    <div style={{position: 'absolute', right: 284, top: 299 - release * 65, fontFamily: 'Display', color: '#FFFFFF', fontSize: 35, opacity: pressure}}>CO₂</div>
    <SceneWipe/>
  </AbsoluteFill>;
};

export const Prototype: React.FC = () => {
  const frame = useCurrentFrame();
  const switchFrame = 228;
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light width={1120} size={70}>{copy.prototype.title}</Heading>
    <Sequence durationInFrames={switchFrame} layout="none" name="Early bottle configurations">
      <Photo id="p10" x={161} y={190} width={382} height={450} angle={-4} delay={6}/>
      <Photo id="p08" x={691} y={190} width={382} height={450} angle={4} delay={13}/>
      <div style={{position: 'absolute', left: 568, top: 343, fontFamily: 'Display', color: coral, fontSize: 83}}>→</div>
    </Sequence>
    <Sequence from={switchFrame} durationInFrames={252} layout="none" name="Complete prototype reveal">
      <Photo id="p09" x={769} y={161} width={198} height={478} angle={2} delay={0} label="03"/>
      <div style={{position: 'absolute', left: 122, top: 223}}><BottleModel id="prototype-model" rocket liquid={0.12} style={{height: 399, width: 206}}/></div>
      <div style={{position: 'absolute', left: 409, top: 291, width: 280, color: blue, fontFamily: 'Display', fontSize: 49, lineHeight: 1.1}}>{copy.prototype.title}</div>
    </Sequence>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const TrialOverlay: React.FC<{shot: Shot; landscape: boolean}> = ({shot, landscape}) => {
  const frame = useCurrentFrame();
  const resultDelay = shot.original ? (shot.stage === 1 ? 54 : 44) : 57;
  const success = shot.stage === 1 ? copy.firstSuccess : resultsCopy.secondSuccess;
  return <>
    <div style={{position: 'absolute', left: 38, top: 38, padding: '13px 23px 16px', borderRadius: 15,
      background: shot.original ? gold : paper, color: ink, fontFamily: 'Display', fontSize: 43,
      boxShadow: '5px 6px 0 #142D5955', rotate: '-2deg',
      translate: `${interpolate(frame, [0, 12], [-55, 0], {...clamp, easing: ease})}px 0px`}}>
      {copy.attempt} {shot.attempt}
    </div>
    {shot.replay && <div style={{position: 'absolute', right: 37, top: 40, padding: '13px 23px', borderRadius: 14,
      color: ink, background: mint, fontFamily: 'Display', fontSize: 40, rotate: '2deg'}}>↺ 0.40×</div>}
    {(shot.original || shot.replay) && <div style={{position: 'absolute', right: 34, top: landscape ? 500 : 356, width: 330,
      fontFamily: 'Display', fontSize: 67, lineHeight: 1.02, color: gold, textShadow: '3px 4px 0 #142D59', rotate: '-5deg',
      opacity: interpolate(frame, [resultDelay, resultDelay + 6], [0, 1], clamp),
      scale: interpolate(frame, [resultDelay, resultDelay + 8, resultDelay + 15], [1.3, 0.96, 1], clamp)}}>{success}</div>}
  </>;
};

export const Trial: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const asset = media[shot.source!];
  const landscape = asset.landscape;
  return <AbsoluteFill>
    <AbsoluteFill style={{background: blue}}/>
    {!landscape && <AbsoluteFill style={{scale: 1.12, filter: 'blur(22px)', opacity: 0.56}}>
      <Video src={staticFile(asset.src)} muted trimBefore={Math.round((shot.trim ?? 0) * fps)} playbackRate={shot.speed ?? 1}
        objectFit="cover" style={{width: '100%', height: '100%'}}/>
    </AbsoluteFill>}
    <div style={{position: 'absolute', left: landscape ? 0 : 437.5, top: 0,
      width: landscape ? 1280 : 405, height: 720,
      background: ink, overflow: 'hidden', boxShadow: '0 0 60px #142D5977'}}>
      <Video src={staticFile(asset.src)} muted trimBefore={Math.round((shot.trim ?? 0) * fps)} playbackRate={shot.speed ?? 1}
        objectFit="contain" style={{width: '100%', height: '100%'}}/>
    </div>
    <TrialOverlay shot={shot} landscape={landscape}/>
  </AbsoluteFill>;
};

export const FirstResult: React.FC = () => <AbsoluteFill>
  <Backdrop light/>
  <Heading light top={202} width={580} size={75}>{introCopy.learning}</Heading>
  <Photo id="p08" x={750} y={75} width={360} height={565} angle={4} delay={0}/>
  <SceneWipe light/>
</AbsoluteFill>;

export const Diagnosis: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light width={1140} size={70}>{copy.diagnosis.title}</Heading>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 90 + i * 390, top: 230, width: 325, height: 388,
      opacity: interpolate(frame, [10 + i * 25, 32 + i * 25], [0, 1], clamp),
      translate: `0px ${interpolate(frame, [10 + i * 25, 44 + i * 25], [45, 0], {...clamp, easing: ease})}px`}}>
      <div style={{position: 'absolute', left: 0, top: 5, width: 310, height: 278, borderRadius: 155, background: [gold, '#FFD9C9', '#CCEDE5'][i]}}/>
      <div style={{position: 'absolute', left: 80, top: -16, rotate: i === 2 ? `${Math.sin(frame / 23) * 7}deg` : '0deg'}}>
        <BottleModel id={`diagnosis-${i}`} liquid={i === 0 ? 0.16 + Math.sin(frame / 32) * 0.055 : 0.38}
          pressure={i === 1 ? 0.8 : 0.2} explode={i === 1 ? 0.65 : 0} style={{width: 155, height: 300}}/>
      </div>
      <div style={{position: 'absolute', left: 0, top: 312, color: ink, fontFamily: 'Display', fontSize: 38, lineHeight: 1.04, width: 308, textAlign: 'center'}}>{copy.diagnosisItems?.[i]}</div>
    </div>)}
    <SceneWipe light/>
  </AbsoluteFill>;
};

const BuildPair: React.FC<{ids: string[]}> = ({ids}) => <>
  {ids.map((id, i) => <Photo key={id} id={id} x={ids.length === 3 ? 89 + i * 368 : 161 + i * 530} y={185 + (i % 2) * 12}
    width={ids.length === 3 ? 324 : 390} height={455} angle={i % 2 ? 3.2 : -3.2} delay={i * 6}/>)}
</>;

export const Rebuild: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading width={1110} size={70}>{copy.rebuild.title}</Heading>
  <Sequence durationInFrames={180} name="Materials and preparation" layout="none"><BuildPair ids={['p01', 'p02']}/></Sequence>
  <Sequence from={180} durationInFrames={180} name="Structure and supports" layout="none"><BuildPair ids={['p03', 'p04']}/></Sequence>
  <Sequence from={360} durationInFrames={180} name="Assembly details" layout="none"><BuildPair ids={['p05', 'p06', 'p07']}/></Sequence>
  <SceneWipe/>
</AbsoluteFill>;

export const SecondStage: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <AbsoluteFill style={{background: coral}}/>
    {copy.secondtests.title.split(',').map((word: string, i: number) => <div key={word} style={{position: 'absolute', left: 90 + i * 115, top: 128 + i * 143,
      fontFamily: 'Display', fontSize: 111, lineHeight: 1, letterSpacing: -5, color: i === 1 ? ink : paper,
      translate: `${interpolate(frame, [i * 8, i * 8 + 14], [180, 0], {...clamp, easing: ease})}px 0px`,
      opacity: interpolate(frame, [i * 8, i * 8 + 7], [0, 1], clamp)}}>{word.trim()}</div>)}
  </AbsoluteFill>;
};
