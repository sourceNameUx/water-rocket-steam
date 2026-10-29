import React, {useEffect, useState} from 'react';
import {AbsoluteFill, CanvasImage, Easing, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const ink = '#142D59';
export const paper = '#FFF9ED';
export const mint = '#82EDCB';
export const coral = '#FF7542';
export const gold = '#FFE15B';
export const blue = '#175BE6';
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Load local documentary fonts'));
  useEffect(() => {
    Promise.all([
      new FontFace('Display', `url(${staticFile('fonts/trebucbd.ttf')})`).load(),
      new FontFace('Body', `url(${staticFile('fonts/segoeui.ttf')})`).load(),
      new FontFace('Mono', `url(${staticFile('fonts/consola.ttf')})`).load(),
    ]).then(fonts => {
      fonts.forEach(font => document.fonts.add(font));
      continueRender(handle);
    }).catch(cancelRender);
  }, [handle]);
  return null;
};

export const Backdrop: React.FC<{light?: boolean; accent?: string}> = ({light = false, accent = mint}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: light ? paper : blue, color: light ? ink : paper, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 820, top: -160, width: 580, height: 970, borderRadius: 290,
      background: light ? '#FFE9C8' : '#3675F2', rotate: '-23deg', translate: `${Math.sin(frame / 110) * 18}px 0px`}}/>
    <div style={{position: 'absolute', left: -100, top: 635, width: 520, height: 120, borderRadius: 60,
      background: light ? '#FF754216' : `${accent}22`, rotate: '-12deg'}}/>
  </AbsoluteFill>;
};

export const Heading: React.FC<{children: React.ReactNode; light?: boolean; top?: number; left?: number; size?: number; width?: number; delay?: number}> = ({children, light, top = 57, left = 64, size = 66, width = 600, delay = 2}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', top, left, width, fontFamily: 'Display', fontWeight: 650, fontSize: size,
    lineHeight: 1.04, letterSpacing: -2.2, color: light ? ink : paper,
    translate: `${interpolate(frame, [delay, delay + 16], [-42, 0], {...clamp, easing: ease})}px 0px`,
    opacity: interpolate(frame, [delay, delay + 8], [0, 1], clamp)}}>{children}</div>;
};

export const SceneWipe: React.FC<{light?: boolean}> = ({light}) => {
  const frame = useCurrentFrame();
  if (frame > 11) return null;
  return <AbsoluteFill style={{pointerEvents: 'none', background: light ? coral : gold,
    left: -150, top: -180, width: 1600, height: 1080, rotate: '-8deg',
    translate: `${interpolate(frame, [0, 11], [0, 1600], {...clamp, easing: ease})}px 0px`}}>
  </AbsoluteFill>;
};

export const Photo: React.FC<{id: string; x: number; y: number; width: number; height: number; angle?: number; delay?: number; label?: string; contain?: boolean}> = ({id, x, y, width, height, angle = 0, delay = 0, label, contain = true}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: x, top: y, width, height, padding: 10,
    boxSizing: 'border-box', background: '#FFFFFF', boxShadow: '8px 10px 0px #142D5920', borderRadius: 8,
    rotate: `${angle + interpolate(frame, [delay, delay + 22], [angle > 0 ? 5 : -5, 0], {...clamp, easing: ease})}deg`,
    translate: `0px ${interpolate(frame, [delay, delay + 20], [65, 0], {...clamp, easing: ease})}px`,
    scale: interpolate(frame, [delay, delay + 140], [0.96, 1.04], clamp), opacity: interpolate(frame, [delay, delay + 8], [0, 1], clamp)}}>
    <div style={{width: '100%', height: '100%', overflow: 'hidden', background: '#EAE5D9', borderRadius: 3}}>
      <CanvasImage src={staticFile(`media/${id}.jpg`)} style={{width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover'}} />
    </div>
  </div>;
};

const bottlePath = 'M 129 108 C 122 143 74 151 71 191 L 62 398 C 60 429 78 450 101 451 L 197 451 C 221 450 240 430 238 399 L 229 191 C 225 151 178 143 171 108 Z';

/** A shaded, ribbed transparent vessel; geometry illustrates the mechanism, not measured flight. */
export const BottleModel: React.FC<{id: string; rocket?: boolean; liquid?: number; pressure?: number; explode?: number; style?: React.CSSProperties}> = ({id, rocket = false, liquid = 0.45, pressure = 0.5, explode = 0, style}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const level = rocket ? 438 - liquid * 235 : 165 + liquid * 235;
  return <svg viewBox="0 0 300 580" style={{width: 300, height: 580, overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={`${id}-glass`} x1="0" x2="1"><stop offset="0" stopColor="#6ba797" stopOpacity="0.6"/><stop offset="0.12" stopColor="#eafff7" stopOpacity="0.54"/><stop offset="0.24" stopColor="#81c9b4" stopOpacity="0.18"/><stop offset="0.65" stopColor="#153b35" stopOpacity="0.65"/><stop offset="0.86" stopColor="#bafbea" stopOpacity="0.46"/><stop offset="1" stopColor="#19483f" stopOpacity="0.7"/></linearGradient>
      <linearGradient id={`${id}-fluid`} x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stopColor="#B4FFF0" stopOpacity="0.95"/><stop offset="0.28" stopColor="#48DAB8" stopOpacity="0.93"/><stop offset="1" stopColor="#0F7184"/></linearGradient>
      <linearGradient id={`${id}-cone`}><stop stopColor="#8A381E"/><stop offset="0.33" stopColor="#FF8246"/><stop offset="0.47" stopColor="#FFD597"/><stop offset="0.55" stopColor="#F07138"/><stop offset="1" stopColor="#933519"/></linearGradient>
      <linearGradient id={`${id}-wood`}><stop stopColor="#8c6840"/><stop offset="0.4" stopColor="#e5c89b"/><stop offset="0.6" stopColor="#c39d68"/><stop offset="1" stopColor="#715434"/></linearGradient>
      <linearGradient id={`${id}-cap`}><stop stopColor="#754029"/><stop offset="0.33" stopColor="#ed9d70"/><stop offset="0.7" stopColor="#a75938"/><stop offset="1" stopColor="#5c3223"/></linearGradient>
      <radialGradient id={`${id}-gas`} cx="30%" cy="25%"><stop stopColor="#f2fff7" stopOpacity="0.72"/><stop offset="0.35" stopColor="#7ce3c2" stopOpacity="0.08"/><stop offset="0.85" stopColor="#529f86" stopOpacity="0.02"/><stop offset="1" stopColor="#ddfff1" stopOpacity="0.45"/></radialGradient>
      <clipPath id={`${id}-clip`}><path d={bottlePath}/></clipPath>
    </defs>
    <ellipse cx="150" cy="557" rx="113" ry="13" fill="#000" opacity="0.14"/>
    <g transform={rocket ? 'translate(0 60) scale(1 .9)' : 'translate(0 530) rotate(180 150 0)'}>
      <path d={bottlePath} fill={`url(#${id}-glass)`} stroke="#d0ffeb" strokeWidth="1.3" strokeOpacity="0.6"/>
      <g clipPath={`url(#${id}-clip)`}>
        <path d={`M 50 ${level} Q 103 ${level - 7 + Math.sin(t * 2) * 4} 150 ${level} T 250 ${level} L 250 ${rocket ? 470 : 50} L 50 ${rocket ? 470 : 50} Z`} fill={`url(#${id}-fluid)`}/>
        <ellipse cx="150" cy={level} rx="95" ry="10" fill="#a9f9d7" opacity="0.32"/>
        {Array.from({length: 24}, (_, i) => {
          const cycle = (t * (0.14 + (i % 4) * 0.035) + i * 0.127) % 1;
          const cx = 82 + (i * 43 % 133) + Math.sin(t + i) * 6;
          return <circle key={i} cx={cx} cy={rocket ? 434 - cycle * 277 : 190 + cycle * 236} r={3 + (i % 5) * 1.35 + pressure * 2}
            fill={`url(#${id}-gas)`} opacity={Math.min(1, cycle * 5) * (1 - cycle) * 0.9}/>;
        })}
        <path d="M 88 197 Q 81 266 80 392" stroke="#f1fff4" strokeWidth="7" opacity="0.25" fill="none" strokeLinecap="round"/>
        <path d="M 101 173 Q 97 189 95 215" stroke="#fff" strokeWidth="3" opacity="0.52" fill="none" strokeLinecap="round"/>
        <path d="M 218 195 L 224 392" stroke="#c7ffe8" strokeWidth="3" opacity="0.3"/>
      </g>
      {[213, 252, 293, 334, 375, 410].map((y, i) => <g key={y} opacity={i === 5 ? 0.48 : 0.33}>
        <path d={`M ${y > 390 ? 67 : 71} ${y} Q 150 ${y + 21} ${y > 390 ? 235 : 229} ${y}`} fill="none" stroke="#e1fff0" strokeWidth="3"/>
        <path d={`M 71 ${y + 5} Q 150 ${y + 23} 229 ${y + 5}`} fill="none" stroke="#041d16" strokeWidth="2"/>
      </g>)}
      <ellipse cx="150" cy="450" rx="55" ry="8" fill="#457668" opacity="0.6"/>
      <rect x="128" y="79" width="44" height="35" rx="6" fill={`url(#${id}-glass)`} stroke="#bdd8ac" strokeWidth="1.2"/>
      <rect x="124" y="107" width="52" height="8" rx="2" fill="#d0b564"/>
      <g transform={`translate(${explode * 47} ${-explode * 72}) rotate(${-explode * 25} 150 88)`} opacity={1 - explode * 0.85}>
        <rect x="125" y="77" width="50" height="23" rx="4" fill={`url(#${id}-cap)`}/>
        {[130, 136, 142, 148, 154, 160, 166, 172].map(x => <path key={x} d={`M ${x} 81 L ${x} 96`} stroke="#edbe95" strokeWidth="1" opacity="0.28"/>)}
      </g>
      {rocket && <>
        <path d={`M 66 ${164 - explode * 20} L 150 ${-64 - explode * 45} L 234 ${164 - explode * 20} Q 150 ${182 - explode * 20} 66 ${164 - explode * 20}`} fill={`url(#${id}-cone)`} stroke="#94a498" strokeWidth="0.7"/>
        <path d={`M 150 ${-64 - explode * 45} L 109 ${164 - explode * 20}`} stroke="#adc0b2" strokeWidth="1" opacity="0.35"/>
        {[67, 222].map(x => <rect key={x} x={x} y="283" width="7" height={234 + explode * 10} rx="2" fill={`url(#${id}-wood)`}/>)}
        <rect x="88" y="389" width="6" height="125" rx="2" fill={`url(#${id}-wood)`} opacity="0.9"/>
        <path d="M 60 324 Q 150 343 241 324 L 241 338 Q 150 357 60 338Z" fill="#dddcc0" opacity="0.38"/>
      </>}
    </g>
  </svg>;
};

/** Depth-sorted atoms and dual bonds, with lit surfaces rather than flat circles. */
export const Molecule: React.FC<{progress?: number; scale?: number}> = ({progress = 0, scale = 1}) => {
  const frame = useCurrentFrame();
  const theta = frame / 85;
  const atoms = [
    {id: 'oxygen-left', x: -154 * Math.cos(theta), y: -41 * Math.sin(theta), z: -Math.sin(theta), radius: 65, fill: 'oxygen'},
    {id: 'carbon', x: 0, y: 0, z: 0, radius: 73, fill: 'carbon'},
    {id: 'oxygen-right', x: 154 * Math.cos(theta), y: 41 * Math.sin(theta), z: Math.sin(theta), radius: 65, fill: 'oxygen'},
  ].sort((a, b) => a.z - b.z);
  return <svg viewBox="0 0 620 420" width={620 * scale} height={420 * scale} style={{overflow: 'visible'}}>
    <defs>
      <radialGradient id="atom-oxygen" cx="31%" cy="23%" r="77%"><stop stopColor="#ffe5ce"/><stop offset="0.20" stopColor="#f7a17c"/><stop offset="0.53" stopColor="#d8614b"/><stop offset="0.85" stopColor="#772f2b"/><stop offset="1" stopColor="#301c1c"/></radialGradient>
      <radialGradient id="atom-carbon" cx="29%" cy="21%" r="80%"><stop stopColor="#DFF2FF"/><stop offset="0.22" stopColor="#75B5FF"/><stop offset="0.52" stopColor="#2766D4"/><stop offset="1" stopColor="#163069"/></radialGradient>
      <linearGradient id="atom-bond" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#bdcebe"/><stop offset="0.38" stopColor="#f2fae8"/><stop offset="0.6" stopColor="#81968b"/><stop offset="1" stopColor="#263f35"/></linearGradient>
    </defs>
    <ellipse cx="310" cy="343" rx="224" ry="19" fill="#000" opacity="0.15"/>
    <g transform={`translate(310 198) rotate(${12 - progress * 10})`}>
      <g transform={`rotate(${Math.atan2(41 * Math.sin(theta), 154 * Math.cos(theta)) * 180 / Math.PI})`}>
        <rect x={-154 * Math.abs(Math.cos(theta))} y="-17" width={308 * Math.abs(Math.cos(theta))} height="12" rx="6" fill="url(#atom-bond)"/>
        <rect x={-154 * Math.abs(Math.cos(theta))} y="7" width={308 * Math.abs(Math.cos(theta))} height="12" rx="6" fill="url(#atom-bond)"/>
      </g>
      {atoms.map(atom => <g key={atom.id} transform={`translate(${atom.x} ${atom.y}) scale(${1 + atom.z * 0.13})`}>
        <circle r={atom.radius} fill={`url(#atom-${atom.fill})`}/>
        <ellipse cx={-atom.radius * 0.27} cy={-atom.radius * 0.39} rx={atom.radius * 0.22} ry={atom.radius * 0.10} fill="#fff7eb" opacity="0.48" transform="rotate(-28)"/>
        <path d={`M ${atom.radius * 0.73} ${-atom.radius * 0.4} A ${atom.radius * 0.84} ${atom.radius * 0.84} 0 0 1 ${atom.radius * 0.57} ${atom.radius * 0.68}`} fill="none" stroke="#eec9af" strokeWidth="1.6" opacity="0.25"/>
      </g>)}
    </g>
  </svg>;
};
