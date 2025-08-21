import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Play, BookOpen, Target, Lightbulb } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  content: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface OnboardingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingSystem: React.FC<OnboardingSystemProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Million Song Mind',
      description: 'Your journey into professional music analysis begins here',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold mb-2">Professional Music Analysis Tool</h3>
            <p className="text-muted-foreground">
              Discover harmonic relationships, analyze chord progressions, 
              and explore the mathematical beauty of music.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-card rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h4 className="font-semibold">Learn</h4>
              <p className="text-sm text-muted-foreground">Guided tutorials</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Analyze</h4>
              <p className="text-sm text-muted-foreground">Harmonic charts</p>
            </div>
            <div className="text-center p-4 bg-card rounded-lg">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <h4 className="font-semibold">Discover</h4>
              <p className="text-sm text-muted-foreground">Musical patterns</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'harmonic-chart',
      title: 'Understanding the Harmonic Chart',
      description: 'The foundation of music theory visualization',
      target: '.harmonic-chart',
      content: (
        <div className="space-y-4">
          <div className="learning-tip">
            The harmonic chart shows chord relationships in your music.
            Each chord is positioned by its harmonic function and frequency of use.
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center">
              <div className="w-3 h-3 bg-primary rounded mr-2"></div>
              Blue bars = Popular chords
            </h4>
            <p className="text-sm text-muted-foreground ml-5">
              The height indicates how often this chord appears in your music
            </p>
            
            <h4 className="font-semibold flex items-center mt-3">
              <div className="w-3 h-3 bg-accent rounded mr-2"></div>
              Green highlights = Related chords
            </h4>
            <p className="text-sm text-muted-foreground ml-5">
              Click any chord to see its harmonic relationships
            </p>
          </div>
        </div>
      ),
      action: {
        text: 'Try clicking a chord!',
        onClick: () => {
          // Highlight first visible chord
          const firstChord = document.querySelector('.chord-button');
          if (firstChord) {
            firstChord.classList.add('animate-pulse');
            setTimeout(() => {
              firstChord.classList.remove('animate-pulse');
            }, 2000);
          }
        }
      }
    },
    {
      id: 'braid-visualization',
      title: 'Explore the Braid Pattern',
      description: 'See musical relationships in geometric form',
      target: '.braid-visualization',
      content: (
        <div className="space-y-4">
          <div className="learning-tip">
            The braid visualization maps chord relationships as a geometric pattern.
            Each circle represents a chord, positioned by its harmonic distance.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Circle Size</h4>
              <p className="text-sm text-muted-foreground">
                Larger circles = more frequently used chords
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Position</h4>
              <p className="text-sm text-muted-foreground">
                Closer circles = more harmonically related
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'search-upload',
      title: 'Adding Your Music',
      description: 'Upload files or search the database',
      content: (
        <div className="space-y-4">
          <div className="learning-tip">
            Upload your own music files or search our database of analyzed songs
            to start exploring harmonic patterns.
          </div>
          <div className="space-y-3">
            <div className="p-3 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">📁 Upload Files</h4>
              <p className="text-sm text-muted-foreground">
                Drop music files to analyze their harmonic content
              </p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <h4 className="font-semibold mb-2">🔍 Search Database</h4>
              <p className="text-sm text-muted-foreground">
                Explore pre-analyzed songs from our million-song database
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready to Explore!',
      description: 'You\'re all set to analyze music like a pro',
      content: (
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">Tutorial Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You now know the basics of Million Song Mind. 
            Start by uploading a song or exploring our database.
          </p>
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg">
            <p className="text-sm">
              💡 <strong>Pro Tip:</strong> Use the help tooltips (?) throughout the app 
              for contextual guidance as you explore.
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="touch-target bg-primary hover:bg-primary/90"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Continue Tutorial
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-responsive-xl">
                <Play className="w-6 h-6 mr-2 text-primary" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-responsive-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="touch-target"
              >
                Minimize
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="touch-target"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}

          {currentStepData.action && (
            <div className="p-4 bg-accent/10 rounded-lg">
              <Button
                onClick={currentStepData.action.onClick}
                className="w-full touch-target"
                variant="outline"
              >
                <Play className="w-4 h-4 mr-2" />
                {currentStepData.action.text}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="touch-target"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Badge variant="secondary" className="px-3 py-1">
              {currentStep + 1} / {tutorialSteps.length}
            </Badge>

            <Button
              onClick={nextStep}
              className="touch-target bg-primary hover:bg-primary/90"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
