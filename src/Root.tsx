import React from 'react';
import { Composition } from 'remotion';
import { RecFrames, RecSheet, REC_SHEET } from './receptionist/Frames';
import { ReceptionistFilm, REC_TOTAL } from './receptionist/Film';
import { ReceptionistFilm3D } from './receptionist/Film3D';
import { LeadFlowFilm, LF_TOTAL } from './leadflow/Film';
import { StarterFilm, calcStarter } from './starter/Film';
import type { FilmSettings, VoiceFile } from './starter/timeline';
import STARTER_FILM from './starter/film.json';
import STARTER_VOICE from './starter/voice.json';

// Starter = a film for any subject, made entirely from src/starter/film.json (start your own film here).
// The two finished films are Receptionist3D and LeadFlow3D (1080x1920, 30 fps, Instagram Reels size).
// Receptionist = the same receptionist film with a flat camera (v2, kept for comparison).
// RecFrames / RecSheet = the storyboard stills the receptionist film was approved from, before any animation.
export const Root: React.FC = () => (
  <>
    <Composition
      id="Starter" component={StarterFilm} durationInFrames={900} fps={30} width={1080} height={1920}
      defaultProps={{ folder: 'starter', film: STARTER_FILM as unknown as FilmSettings, voice: STARTER_VOICE as VoiceFile }}
      calculateMetadata={calcStarter}
    />
    <Composition id="Receptionist3D" component={ReceptionistFilm3D} durationInFrames={REC_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="LeadFlow3D" component={LeadFlowFilm} durationInFrames={LF_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="Receptionist" component={ReceptionistFilm} durationInFrames={REC_TOTAL} fps={30} width={1080} height={1920} defaultProps={{ bgm: true }} />
    <Composition id="RecFrames" component={RecFrames} durationInFrames={9} fps={30} width={1080} height={1920} />
    <Composition id="RecSheet" component={RecSheet} durationInFrames={1} fps={30} width={REC_SHEET.w} height={REC_SHEET.h} />
  </>
);
