import React from 'react';
import { Composition } from 'remotion';
import { RecFrames, RecSheet, REC_SHEET } from './receptionist/Frames';
import { ReceptionistFilm, REC_TOTAL } from './receptionist/Film';
import { ReceptionistFilm3D } from './receptionist/Film3D';
import { LeadFlowFilm, LF_TOTAL } from './leadflow/Film';

// The two finished films are Receptionist3D and LeadFlow3D (1080x1920, 30 fps, Instagram Reels size).
// Receptionist = the same receptionist film with a flat camera (v2, kept for comparison).
// RecFrames / RecSheet = the storyboard stills the receptionist film was approved from, before any animation.
export const Root: React.FC = () => (
  <>
    <Composition id="Receptionist3D" component={ReceptionistFilm3D} durationInFrames={REC_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="LeadFlow3D" component={LeadFlowFilm} durationInFrames={LF_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="Receptionist" component={ReceptionistFilm} durationInFrames={REC_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="RecFrames" component={RecFrames} durationInFrames={9} fps={30} width={1080} height={1920} />
    <Composition id="RecSheet" component={RecSheet} durationInFrames={1} fps={30} width={REC_SHEET.w} height={REC_SHEET.h} />
  </>
);
