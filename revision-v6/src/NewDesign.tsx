import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, CanvasImage, Interactive, Sequence, Track, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Fonts, Heading, SceneWipe, blue, clamp, coral, ease, gold, ink, mint, paper} from './design';
import copy from './design-copy.json';
import scienceCopy from './science-copy.json';

type CopyKey = keyof typeof copy;

const Caption: React.FC<{id: CopyKey; top?: number; width?: number; light?: boolean}> = ({id, top = 238, width = 540, light = false}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: 68, top, width, fontFamily: 'Display', fontSize: 42, lineHeight: 1.13,
    color: light ? ink : paper, opacity: interpolate(frame, [12, 24], [0, 1], clamp),
    translate: `0px ${interpolate(frame, [12, 30], [20, 0], {...clamp, easing: ease})}px`}}>{copy[id].caption}</div>;
};

const DesignPhoto: React.FC<{file: string; x: number; y: number; width: number; height: number; angle?: number; delay?: number; children?: React.ReactNode}> = ({file, x, y, width, height, angle = 0, delay = 0, children}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: x, top: y, width, height, background: '#E8E4D9', border: '9px solid white',
    borderRadius: 12, boxShadow: '10px 13px 0 #142D5930', rotate: `${angle}deg`,
    translate: `0px ${interpolate(frame, [delay, delay + 19], [60, 0], {...clamp, easing: ease})}px`,
    opacity: interpolate(frame, [delay, delay + 10], [0, 1], clamp),
    scale: interpolate(frame, [delay, delay + 180], [0.985, 1.015], clamp)}}>
    <CanvasImage src={staticFile(`design/${file}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4}}/>
    {children}
  </div>;
};

const Pointer: React.FC<{d: string; color?: string; delay?: number; id: string}> = ({d, color = coral, delay = 22, id}) => {
  const frame = useCurrentFrame();
  return <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, width: 1280, height: 720, pointerEvents: 'none'}}>
    <defs><marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker></defs>
    <path d={d} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" pathLength="1"
      strokeDasharray="1" strokeDashoffset={interpolate(frame, [delay, delay + 23], [1, 0], {...clamp, easing: ease})}
      markerEnd={frame > delay + 20 ? `url(#${id})` : undefined}/>
  </svg>;
};

const RocketDiagram: React.FC<{thrust?: boolean}> = ({thrust = false}) => {
  const frame = useCurrentFrame();
  return <svg viewBox="0 0 430 420" width="430" height="420">
    <defs>
      <linearGradient id="new-body"><stop stopColor="#061229"/><stop offset="0.33" stopColor="#526381"/><stop offset="0.5" stopColor="#243653"/><stop offset="1" stopColor="#101D33"/></linearGradient>
      <linearGradient id="new-fin"><stop stopColor="#102641"/><stop offset="0.5" stopColor="#61718B"/><stop offset="1" stopColor="#16243E"/></linearGradient>
    </defs>
    <g transform={`translate(215 208) rotate(${thrust ? 0 : interpolate(frame, [0, 35, 70, 120], [-13, 6, -2, 0], clamp)}) translate(-215 -208)`}>
      <path d="M 183 151 L 215 51 L 247 151 Q 215 160 183 151" fill="url(#new-body)" stroke="#8293A9" strokeWidth="1.5"/>
      <path d="M 180 148 L 250 148 L 252 296 Q 215 326 178 296 Z" fill="url(#new-body)" stroke="#75849E" strokeWidth="1.5"/>
      <path d="M 179 238 L 116 278 L 116 335 L 180 306 Z M 251 238 L 314 278 L 314 335 L 250 306 Z" fill="url(#new-fin)" stroke={gold} strokeWidth="2"/>
      <path d="M 213 243 L 222 283 L 216 337 L 208 295 Z" fill="#718096"/>
      <path d="M 187 180 Q 215 187 245 180 M 184 223 Q 215 230 247 223" stroke="#8396B0" opacity="0.48" fill="none" strokeWidth="4"/>
      <path d="M 196 163 L 192 227" stroke="#C6D3E4" opacity="0.5" strokeWidth="3"/>
      {thrust && Array.from({length: 9}, (_, index) => {
        const fall = ((frame * 2 + index * 11) % 85) / 85;
        return <ellipse key={index} cx={215 + Math.sin(index * 2.4) * (6 + fall * 25)} cy={320 + fall * 85}
          rx={3 + fall * 2} ry={7} fill={mint} opacity={1 - fall * 0.4}/>;
      })}
    </g>
    {[77, 354].map((x, i) => <g key={x} stroke={thrust && i === 1 ? coral : mint} strokeWidth="6" strokeLinecap="round" fill="none">
      <path d={`M ${x} ${thrust && i === 1 ? 316 : 140} L ${x} ${thrust && i === 1 ? 132 : 312}`} strokeDasharray="21 13" strokeDashoffset={-frame * 1.8}/>
      <path d={thrust && i === 1 ? `M ${x - 12} 148 L ${x} 130 L ${x + 12} 148` : `M ${x - 12} 296 L ${x} 315 L ${x + 12} 296`}/>
    </g>)}
  </svg>;
};

const Reveal: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={105} width={630} size={99}>{copy['design-reveal'].title}</Heading>
  <Caption id="design-reveal" top={372} width={520}/>
  <div style={{position: 'absolute', left: 715, top: 92, width: 510, height: 510, background: gold, borderRadius: '50%'}}/>
  <DesignPhoto file="final-001" x={810} y={30} width={300} height={642} angle={4}/>
  <SceneWipe/>
</AbsoluteFill>;

const Fins: React.FC = () => <AbsoluteFill>
  <Backdrop light/>
  <Heading light top={67} size={106}>{copy['design-fins'].title}</Heading>
  <Caption id="design-fins" top={203} light/>
  <div style={{position: 'absolute', left: 102, top: 285, scale: 0.88, transformOrigin: 'top left'}}><RocketDiagram/></div>
  <DesignPhoto file="fins-detail" x={754} y={81} width={414} height={552} angle={1}/>
  <Pointer id="fin-pointer" d="M 527 394 C 656 344 668 425 809 439"/>
  <SceneWipe light/>
</AbsoluteFill>;

const Base: React.FC = () => <AbsoluteFill>
  <Backdrop light/>
  <Heading light top={62} size={82} width={710}>{copy['design-base'].title}</Heading>
  <Caption id="design-base" top={175} width={560} light/>
  <DesignPhoto file="final-005" x={138} y={300} width={207} height={336} angle={-4}/>
  <DesignPhoto file="final-003" x={845} y={55} width={275} height={604} angle={3}/>
  <Pointer id="base-pointer" d="M 422 501 C 564 439 711 606 949 573"/>
  <SceneWipe light/>
</AbsoluteFill>;

const Nose: React.FC = () => <AbsoluteFill>
  <Backdrop/>
  <Heading top={86} width={600} size={92}>{copy['design-nose'].title}</Heading>
  <Caption id="design-nose" top={312} width={505}/>
  <DesignPhoto file="nose-detail" x={818} y={66} width={356} height={556} angle={-2}/>
  <Pointer id="air-left" color={mint} d="M 978 55 C 840 138 765 242 769 426" delay={28}/>
  <Pointer id="air-right" color={mint} d="M 1011 55 C 1168 140 1217 252 1201 427" delay={34}/>
  <SceneWipe/>
</AbsoluteFill>;

const Assembly: React.FC = () => <AbsoluteFill>
  <Backdrop light/>
  <Heading light top={94} width={565} size={90}>{copy['design-assembly'].title}</Heading>
  <Caption id="design-assembly" top={389} width={505} light/>
  <DesignPhoto file="final-002" x={664} y={172} width={255} height={412} angle={-5}/>
  <DesignPhoto file="final-004" x={939} y={67} width={223} height={610} angle={4} delay={8}/>
  <SceneWipe light/>
</AbsoluteFill>;

const Science: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop/>
    <Heading top={62} width={640} size={83}>{copy['design-science'].title}</Heading>
    <Caption id="design-science" top={275}/>
    <div style={{position: 'absolute', left: 68, top: 404, fontFamily: 'Display', fontSize: 72, color: gold,
      opacity: interpolate(frame, [175, 193], [0, 1], clamp)}}>Eₖ = ½mv²</div>
    <div style={{position: 'absolute', left: 71, top: 499, fontFamily: 'Body', fontSize: 36, color: paper,
      opacity: interpolate(frame, [175, 193], [0, 1], clamp)}}>{scienceCopy.kineticEnergy}</div>
    <div style={{position: 'absolute', left: 760, top: 150, scale: 1.15, transformOrigin: 'top left'}}><RocketDiagram thrust/></div>
    <div style={{position: 'absolute', right: 52, top: 180, color: coral, fontFamily: 'Display', fontSize: 31}}>{scienceCopy.rocketThrust}</div>
    <div style={{position: 'absolute', left: 828, top: 643, color: mint, fontFamily: 'Display', fontSize: 31}}>{scienceCopy.expelledLiquid}</div>
    <SceneWipe/>
  </AbsoluteFill>;
};

const Height: React.FC = () => {
  const frame = useCurrentFrame();
  const assumedVerticalSpeed = 10;
  const gravity = 9.81;
  const additionalRise = assumedVerticalSpeed ** 2 / (2 * gravity);
  const progress = interpolate(frame, [170, 260], [0, 1], {...clamp, easing: ease});
  return <AbsoluteFill>
    <Backdrop light/>
    <Heading light top={48} width={1150} size={72}>{copy['design-height'].title}</Heading>
    <div style={{position: 'absolute', left: 66, top: 156, fontFamily: 'Display', fontSize: 30, color: ink}}>{scienceCopy.assumedSpeed}</div>
    <div style={{position: 'absolute', left: 66, top: 199, width: 760, fontFamily: 'Body', fontSize: 35, color: ink}}>vᵧ = {assumedVerticalSpeed} m/s · g = {gravity} m/s²</div>
    <div style={{position: 'absolute', left: 66, top: 264, fontFamily: 'Display', fontSize: 64, color: blue}}>Δh = vᵧ² / (2g)</div>
    <div style={{position: 'absolute', left: 70, top: 347, fontFamily: 'Display', fontSize: 48, color: ink,
      opacity: interpolate(frame, [100, 116], [0, 1], clamp)}}>= 100 / 19.62</div>
    <div style={{position: 'absolute', left: 67, top: 435, fontFamily: 'Display', fontSize: 89, color: coral,
      opacity: interpolate(frame, [170, 185], [0, 1], clamp)}}>≈ {additionalRise.toFixed(1)} m</div>
    <div style={{position: 'absolute', left: 71, top: 540, fontFamily: 'Body', fontSize: 30, color: ink}}>{scienceCopy.reference}</div>
    <svg width="380" height="445" viewBox="0 0 380 445" style={{position: 'absolute', left: 861, top: 163}}>
      <path d="M 40 375 H 311 M 40 375 V 38" stroke={ink} strokeWidth="3" fill="none"/>
      <polyline points={Array.from({length: 91}, (_, index) => {
        const time = progress * index / 90;
        return `${40 + time * 252},${375 - (2 * time - time * time) * 308}`;
      }).join(' ')} stroke={blue} strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M 310 375 V 67 M 300 83 L 310 67 L 320 83 M 300 359 L 310 375 L 320 359" stroke={coral} strokeWidth="5" fill="none" opacity={progress}/>
      <circle cx={40 + progress * 252} cy={375 - (2 * progress - progress * progress) * 308} r="12" fill={gold} stroke={ink} strokeWidth="3"/>
      <text x="160" y="419" fill={ink} fontFamily="Body" fontSize="26">t (s)</text>
      <text x="0" y="29" fill={ink} fontFamily="Body" fontSize="26">Δh (m)</text>
      <text x="8" y="384" fill={ink} fontFamily="Body" fontSize="23">0</text>
    </svg>
    <div style={{position: 'absolute', right: 43, bottom: 91, width: 352, color: ink, fontFamily: 'Body', fontSize: 28, textAlign: 'center'}}>{scienceCopy.noDrag}</div>
    <div style={{position: 'absolute', left: 66, bottom: 44, padding: '14px 22px', borderRadius: 12,
      background: gold, color: ink, fontFamily: 'Display', fontSize: 34}}>{copy['design-height'].caption}</div>
    <SceneWipe light/>
  </AbsoluteFill>;
};

const NewDesignInner: React.FC<{includeAudio?: boolean}> = ({includeAudio = true}) => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Fonts/>
    <Track name="New design and scientific explanation">
      <Sequence name="Final design / full photograph" from={0} durationInFrames={6 * fps}><Reveal/></Sequence>
      <Sequence name="Fins / directional stability" from={6 * fps} durationInFrames={10 * fps}><Fins/></Sequence>
      <Sequence name="Green base / ground support" from={16 * fps} durationInFrames={8 * fps}><Base/></Sequence>
      <Sequence name="Conical nose / airflow" from={24 * fps} durationInFrames={8 * fps}><Nose/></Sequence>
      <Sequence name="Assembly / taped joints" from={32 * fps} durationInFrames={8 * fps}><Assembly/></Sequence>
      <Sequence name="Pressure / reaction / kinetic energy" from={40 * fps} durationInFrames={10 * fps}><Science/></Sequence>
      <Sequence name="Height / explicitly assumed example" from={50 * fps} durationInFrames={18 * fps}><Height/></Sequence>
    </Track>
    {includeAudio && <Track name="New first-person narration"><Audio src={staticFile('audio/design-voice.wav')}/></Track>}
    {includeAudio && <Track name="New design underscore"><Audio src={staticFile('audio/design-music.wav')}/></Track>}
  </AbsoluteFill>;
};

export const NewDesign = Interactive.create({Component: NewDesignInner, layout: 'absolute-fill', schema: {
  includeAudio: {type: 'boolean', default: true, description: 'Use standalone narration and music; the parent provides its own corrected stems'},
}});
