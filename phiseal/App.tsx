import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import UploadScreen from './src/screens/UploadScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import ExportScreen from './src/screens/ExportScreen';
import type { IntentType, Manifest } from './src/types/manifest';

type Screen =
  | 'onboarding'
  | 'upload'
  | 'processing'
  | 'results'
  | 'question'
  | 'export';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [intent, setIntent] = useState<IntentType>('analysis');
  const [fileInfo, setFileInfo] = useState<{
    uri: string;
    name: string;
    type: 'pdf' | 'docx';
    hash: string;
  } | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);

  const handleIntentSelected = (selectedIntent: IntentType) => {
    setIntent(selectedIntent);
    setCurrentScreen('upload');
  };

  const handleDocumentSelected = (
    uri: string,
    name: string,
    type: 'pdf' | 'docx',
    hash: string
  ) => {
    setFileInfo({ uri, name, type, hash });
    setCurrentScreen('processing');
  };

  const handleAnalysisComplete = (resultManifest: Manifest) => {
    setManifest(resultManifest);
    setCurrentScreen('results');
  };

  const handleAnalysisError = (error: string) => {
    console.error('Analysis error:', error);
    // In a real app, show error screen or alert
    setCurrentScreen('upload');
  };

  const handleAskQuestion = () => {
    setCurrentScreen('question');
  };

  const handleExport = () => {
    setCurrentScreen('export');
  };

  const handleNewAnalysis = () => {
    setFileInfo(null);
    setManifest(null);
    setCurrentScreen('onboarding');
  };

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onIntentSelected={handleIntentSelected} />;

      case 'upload':
        return (
          <UploadScreen
            intent={intent}
            onDocumentSelected={handleDocumentSelected}
            onBack={handleBackToOnboarding}
          />
        );

      case 'processing':
        return fileInfo ? (
          <ProcessingScreen
            fileUri={fileInfo.uri}
            fileName={fileInfo.name}
            fileType={fileInfo.type}
            intent={intent}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
        ) : null;

      case 'results':
        return manifest ? (
          <ResultsScreen
            manifest={manifest}
            onAskQuestion={handleAskQuestion}
            onExport={handleExport}
            onNewAnalysis={handleNewAnalysis}
          />
        ) : null;

      case 'question':
        return manifest ? (
          <QuestionScreen manifest={manifest} onBack={handleBackToResults} />
        ) : null;

      case 'export':
        return manifest ? (
          <ExportScreen manifest={manifest} onBack={handleBackToResults} />
        ) : null;

      default:
        return <OnboardingScreen onIntentSelected={handleIntentSelected} />;
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      {renderScreen()}
    </>
  );
}
