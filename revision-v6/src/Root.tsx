import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Composition, Folder, Sequence, Track, staticFile, useVideoConfig} from 'remotion';
import {Fonts, ink} from './design';
import {Chemistry, Diagnosis, FirstResult, Opening, Physics, Prototype, Rebuild, SecondStage, Shot, Trial} from './scenes';
import edit from './edit.json';
import {NewDesign} from './NewDesign';
import {PhotoOpening, PhotoChemistry} from './PhotoOpening';
import {ResultsV6} from './ResultsV6';

const shot = (id: string) => {
  const result = (edit.sections as Shot[]).find(item => item.id === id);
  if (!result) throw new Error(`Missing shot: ${id}`);
  return result;
};

const TrialClip: React.FC<{id: string}> = ({id}) => <Trial shot={shot(id)}/>;

const Body: React.FC = () => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: ink}}>
    <Fonts/>
    <Track name="Picture">
      <Sequence name="STEAM introduction / project photo montage" from={0} durationInFrames={7 * fps}><PhotoOpening/></Sequence>
      <Sequence name="Materials and chemistry / real photographs" from={7 * fps} durationInFrames={18 * fps}><PhotoChemistry/></Sequence>
      <Sequence name="Physics / pressure and reaction" from={25 * fps} durationInFrames={18 * fps}><Physics/></Sequence>
      <Sequence name="First prototype / photo development" from={43 * fps} durationInFrames={16 * fps}><Prototype/></Sequence>
      <Sequence name="First trial" from={59 * fps} durationInFrames={6 * fps}><TrialClip id="first-test"/></Sequence>
      <Sequence name="Second trial" from={65 * fps} durationInFrames={6 * fps}><TrialClip id="second-test"/></Sequence>
      <Sequence name="First launch / synchronized success comment" from={71 * fps} durationInFrames={3 * fps}><TrialClip id="first-launch"/></Sequence>
      <Sequence name="First launch / replay" from={74 * fps} durationInFrames={4 * fps}><TrialClip id="first-replay"/></Sequence>
      <Sequence name="First result / learning to measure" from={78 * fps} durationInFrames={5 * fps}><FirstResult/></Sequence>
      <Sequence name="Diagnosis / three variables" from={83 * fps} durationInFrames={12 * fps}><Diagnosis/></Sequence>
      <Sequence name="Rebuild / assembly montage" from={95 * fps} durationInFrames={18 * fps}><Rebuild/></Sequence>
      <Sequence name="Second stage / chapter" from={113 * fps} durationInFrames={2 * fps}><SecondStage/></Sequence>
      <Sequence name="Attempt 01" from={115 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-01"/></Sequence>
      <Sequence name="Attempt 02 / short field insert" from={120 * fps} durationInFrames={2.6 * fps}><TrialClip id="attempt-02"/></Sequence>
      <Sequence name="Attempt 03 / short field insert" from={122.6 * fps} durationInFrames={2.6 * fps}><TrialClip id="attempt-03"/></Sequence>
      <Sequence name="Attempt 04" from={125.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-04"/></Sequence>
      <Sequence name="Attempt 05" from={130.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-05"/></Sequence>
      <Sequence name="Attempt 06" from={135.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-06"/></Sequence>
      <Sequence name="Attempt 07" from={140.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-07"/></Sequence>
      <Sequence name="Attempt 08" from={145.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-08"/></Sequence>
      <Sequence name="Attempt 09" from={150.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-09"/></Sequence>
      <Sequence name="Attempt 10" from={155.2 * fps} durationInFrames={5 * fps}><TrialClip id="attempt-10"/></Sequence>
      <Sequence name="Second launch / synchronized success comment" from={160.2 * fps} durationInFrames={4.5 * fps}><TrialClip id="second-launch"/></Sequence>
      <Sequence name="Second launch / replay" from={164.7 * fps} durationInFrames={4.5 * fps}><TrialClip id="second-replay"/></Sequence>
      <NewDesign name="Final design / photos and scientific model" from={169.2 * fps} durationInFrames={68 * fps} includeAudio={false}/>
      <ResultsV6 name="Final launch / results and estimates" from={237.2 * fps} durationInFrames={86 * fps}/>
    </Track>
    <Track name="Corrected first-person voice"><Audio src={staticFile('audio/v6-voice.wav')}/></Track>
    <Track name="Original launch recordings / speech ducked"><Audio src={staticFile('audio/v6-location.wav')}/></Track>
    <Track name="Corrected underscore"><Audio src={staticFile('audio/v6-music.wav')}/></Track>
    <Track name="Edit accents"><Audio src={staticFile('audio/effects.wav')}/></Track>
  </AbsoluteFill>;
};

const ChemistryPreview = () => <><Fonts/><PhotoChemistry/></>;
const PhysicsPreview = () => <><Fonts/><Physics/></>;
const OpeningPreview = () => <><Fonts/><PhotoOpening/></>;

export const Root = () => <>
  <Composition id="RocketBody" component={Body} width={1280} height={720} fps={30} durationInFrames={edit.durationInFrames}/>
  <Composition id="NewDesign" component={NewDesign} width={1280} height={720} fps={30} durationInFrames={2040}/>
  <Folder name="Animation-scenes">
    <Composition id="Opening" component={OpeningPreview} width={1280} height={720} fps={30} durationInFrames={210}/>
    <Composition id="Chemistry" component={ChemistryPreview} width={1280} height={720} fps={30} durationInFrames={540}/>
    <Composition id="Physics" component={PhysicsPreview} width={1280} height={720} fps={30} durationInFrames={540}/>
  </Folder>
</>;
