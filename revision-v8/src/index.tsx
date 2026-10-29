import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Fonts} from '../../revision-v6/src/design';
import {Results} from './Results';

const Ending = () => <><Fonts/><Results/></>;
const Root = () => <Composition id="SpanishEnding" component={Ending} width={1280} height={720} fps={30} durationInFrames={2580}/>;
registerRoot(Root);
