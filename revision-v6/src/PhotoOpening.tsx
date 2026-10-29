import React from 'react';
import {AbsoluteFill, CanvasImage, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Heading, SceneWipe, blue, clamp, ease, gold, ink, paper} from './design';
import copy from './copy.json';
import intro from './intro-copy.json';

const PhotoCard: React.FC<{file: string; x: number; y: number; width: number; height: number; angle?: number; delay?: number; fit?: 'cover' | 'contain'}> =
  ({file, x, y, width, height, angle = 0, delay = 0, fit = 'cover'}) => {
    const frame = useCurrentFrame();
    return <div style={{position: 'absolute', left: x, top: y, width, height, background: 'white', border: '8px solid white',
      borderRadius: 12, overflow: 'hidden', boxShadow: '8px 10px 0 #142D5940', rotate: `${angle}deg`,
      opacity: interpolate(frame, [delay, delay + 9], [0, 1], clamp),
      translate: `0px ${interpolate(frame, [delay, delay + 23], [45, 0], {...clamp, easing: ease})}px`,
      scale: interpolate(frame, [0, 210], [1, 1.035], clamp)}}>
      <CanvasImage src={staticFile(file)} style={{width: '100%', height: '100%', objectFit: fit}}/>
    </div>;
  };

export const PhotoOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Backdrop/>
    <div style={{position: 'absolute', left: 68, top: 48, color: gold, fontFamily: 'Display', fontSize: 39,
      opacity: interpolate(frame, [2, 13], [0, 1], clamp)}}>{intro.project}</div>
    <Heading top={101} size={88} width={725}>{intro.title}</Heading>
    <div style={{position: 'absolute', left: 71, top: 219, color: paper, fontFamily: 'Display', fontSize: 41,
      opacity: interpolate(frame, [12, 24], [0, 1], clamp)}}>{intro.competition}</div>
    <Sequence name="Opening photos / first prototype and assembly" durationInFrames={3.4 * fps}>
      <PhotoCard file="intro/early-setup.jpg" x={74} y={320} width={238} height={266} angle={-4} delay={3}/>
      <PhotoCard file="intro/build-hands.jpg" x={364} y={323} width={343} height={258} angle={3} delay={10}/>
    </Sequence>
    <Sequence name="Opening photos / construction close-up and fins" from={3.4 * fps} durationInFrames={3.6 * fps}>
      <PhotoCard file="intro/build-detail.jpg" x={77} y={332} width={343} height={249} angle={-3}/>
      <PhotoCard file="design/fins-detail.jpg" x={465} y={318} width={238} height={270} angle={4} delay={5}/>
    </Sequence>
    <PhotoCard file="design/final-003.jpg" x={918} y={63} width={249} height={590} angle={3} delay={15} fit="contain"/>
    <div style={{position: 'absolute', left: 73, bottom: 51, color: paper, fontFamily: 'Body', fontSize: 31}}>{copy.name}</div>
  </AbsoluteFill>;
};

const IngredientPhotos: React.FC = () => <AbsoluteFill>
  <Heading light top={57} width={1120} size={77}>{intro.materials}</Heading>
  <PhotoCard file="intro/bottle.jpg" x={82} y={196} width={262} height={337} angle={-2} fit="contain"/>
  <PhotoCard file="intro/vinegar.jpg" x={455} y={196} width={320} height={337} angle={1} delay={5} fit="contain"/>
  <PhotoCard file="intro/baking-soda.jpg" x={867} y={196} width={316} height={337} angle={-1} delay={10} fit="contain"/>
  <div style={{position: 'absolute', top: 563, left: 77, width: 290, textAlign: 'center', fontFamily: 'Display', color: ink, fontSize: 35}}>{intro.bottle}</div>
  <div style={{position: 'absolute', top: 563, left: 450, width: 335, textAlign: 'center', fontFamily: 'Display', color: ink, fontSize: 35}}>{copy.ingredients[0]}</div>
  <div style={{position: 'absolute', top: 554, left: 863, width: 330, textAlign: 'center', fontFamily: 'Display', color: ink, fontSize: 33, lineHeight: 1.08}}>{copy.ingredients[1]}</div>
  <div style={{position: 'absolute', bottom: 35, right: 74, color: ink, fontFamily: 'Body', fontSize: 18}}>{intro.referencePhotos}: OpenStax · CC BY 4.0 / Thavox · PD</div>
</AbsoluteFill>;

const ReactionPhoto: React.FC = () => <AbsoluteFill>
  <Heading light top={58} width={1130} size={70}>{copy.chemistry.title}</Heading>
  <div style={{position: 'absolute', left: 69, top: 244, color: blue, fontFamily: 'Display', fontSize: 134}}>CO₂</div>
  <div style={{position: 'absolute', left: 72, top: 405, width: 435, color: ink, fontFamily: 'Display', fontSize: 42}}>{copy.gas}</div>
  <PhotoCard file="intro/reaction.jpg" x={594} y={213} width={577} height={370} angle={2}/>
  <div style={{position: 'absolute', bottom: 57, right: 75, color: ink, fontFamily: 'Body', fontSize: 19}}>{intro.referencePhotos}: katerha · CC BY 2.0</div>
</AbsoluteFill>;

const SealPhoto: React.FC = () => <AbsoluteFill>
  <Heading light top={65} width={640} size={76}>{intro.seal}</Heading>
  <PhotoCard file="intro/early-setup.jpg" x={844} y={89} width={287} height={522} angle={3} fit="contain"/>
  <div style={{position: 'absolute', left: 72, top: 355, width: 650, color: blue, fontFamily: 'Display', fontSize: 44, lineHeight: 1.5}}>
    CH₃COOH + NaHCO₃<br/>→ CH₃COONa + H₂O + CO₂
  </div>
</AbsoluteFill>;

export const PhotoChemistry: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Backdrop light/>
    <Sequence name="Actual bottle and reference ingredient photographs" durationInFrames={5.8 * fps}><IngredientPhotos/></Sequence>
    <Sequence name="Photographed chemical reaction" from={5.8 * fps} durationInFrames={5.5 * fps}><ReactionPhoto/></Sequence>
    <Sequence name="Photographed bottle and sealing explanation" from={11.3 * fps} durationInFrames={6.7 * fps}><SealPhoto/></Sequence>
    <SceneWipe light/>
  </AbsoluteFill>;
};
