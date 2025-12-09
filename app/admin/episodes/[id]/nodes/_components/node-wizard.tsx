// /app/admin/episodes/[id]/_components/node-wizard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import type { 
  WizardState, 
  DropdownData, 
  WizardStep, 
  ExistingNode, 
  NodeCategory,
  ConditionType,
  TargetType,
  EffectType,
  ConditionData,
  TargetData,
  EffectData
} from '@/lib/types/wizard';
import { createNodeWithLogic, updateNodeWithLogic } from '@/lib/actions/nodes-actions';
import { StepConditions } from './step-conditions';
import { StepTargets } from './step-targets';
import { StepEffects } from './step-effects';
import { StepHtmlEditor } from './step-html-editor';

interface Props {
  episodeId: string;
  dropdownData: DropdownData;
  mode: 'create' | 'edit';
  existingNode?: ExistingNode;
}

const STEPS: WizardStep[] = [
  { id: 1, name: 'Conditions', description: 'Quando il nodo diventa visibile', icon: '🔓' },
  { id: 2, name: 'Targets', description: 'Obiettivi da completare', icon: '🎯' },
  { id: 3, name: 'Effects', description: 'Ricompense al completamento', icon: '✨' },
  { id: 4, name: 'Content', description: 'Contenuto HTML interattivo', icon: '📝' },
];

export function NodeWizard({ episodeId, dropdownData, mode, existingNode }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize wizard state
  const [state, setState] = useState<WizardState>({
    name: existingNode?.name || '',
    category: (existingNode?.node_category as NodeCategory) || 'main_story',
    hideProgressItemId: existingNode?.hide_progress_item_id || null, // AGGIUNTO
    conditions: existingNode?.conditions.map(c => ({
      type: c.type as ConditionType,
      payload: c.payload,
      tempId: crypto.randomUUID()
    })) || [],
    targets: existingNode?.targets.map(t => ({
      type: t.type as TargetType,
      payload: t.payload,
      tempId: t.target_id || crypto.randomUUID()
    })) || [],
    effects: existingNode?.effects.map(e => ({
      type: e.type as EffectType,
      payload: e.payload,
      tempId: crypto.randomUUID()
    })) || [],
    contentHtml: existingNode?.content_html || '',
    currentStep: 1,
  });

  const currentStepData = STEPS.find(s => s.id === state.currentStep)!;
  const progress = (state.currentStep / STEPS.length) * 100;

  // Validation per ogni step
  const canProceed = (): boolean => {
    switch (state.currentStep) {
      case 1: return true; // Conditions opzionali
      case 2: return state.targets.length > 0; // Almeno 1 target obbligatorio
      case 3: return true; // Effects opzionali
      case 4: return state.name.trim() !== '' && state.contentHtml.trim() !== ''; // Nome e HTML obbligatori
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && state.currentStep < STEPS.length) {
      setState((prev: WizardState) => ({ ...prev, currentStep: prev.currentStep + 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (state.currentStep > 1) {
      setState((prev: WizardState) => ({ ...prev, currentStep: prev.currentStep - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSaving(true);
    try {
      const nodeData = {
        name: state.name,
        category: state.category,
        hideProgressItemId: state.hideProgressItemId, // AGGIUNTO
        contentHtml: state.contentHtml,
        conditions: state.conditions.map((c: ConditionData) => ({ type: c.type, payload: c.payload })),
        targets: state.targets.map((t: TargetData) => ({ type: t.type, payload: t.payload })),
        effects: state.effects.map((e: EffectData) => ({ type: e.type, payload: e.payload })),
      };

      if (mode === 'create') {
        await createNodeWithLogic(episodeId, nodeData);
      } else if (existingNode) {
        await updateNodeWithLogic(existingNode.node_id, episodeId, nodeData);
      }
      
      router.push(`/admin/episodes/${episodeId}`);
    } catch (error) {
      console.error('Failed to save node:', error);
      alert('Errore durante il salvataggio del nodo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header con Progress */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Crea Nuovo Nodo' : 'Modifica Nodo'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Step {state.currentStep} di {STEPS.length}: {currentStepData.description}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/episodes/${episodeId}`)}
              className="border-slate-600 hover:bg-slate-800"
            >
              Annulla
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-between mt-4">
            {STEPS.map(step => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 ${
                  step.id === state.currentStep 
                    ? 'text-amber-400 font-semibold' 
                    : step.id < state.currentStep
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                <span className="text-xl">{step.icon}</span>
                <span className="text-sm hidden md:inline">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {state.currentStep === 1 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4">Step 1: Conditions (Opzionale)</h2>
              <p className="text-slate-400 mb-6">
                Definisci quando questo nodo diventa visibile al giocatore. 
                Se non aggiungi conditions, il nodo sarà sempre visibile.
              </p>
              <StepConditions
                conditions={state.conditions}
                dropdownData={dropdownData}
                onChange={(conditions) => setState((prev: WizardState) => ({ ...prev, conditions }))}
              />
            </div>
          )}

          {state.currentStep === 2 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4">Step 2: Targets (Obbligatorio)</h2>
              <p className="text-slate-400 mb-6">
                Definisci gli obiettivi che il giocatore deve completare. 
                <strong> Almeno 1 target è obbligatorio.</strong>
              </p>
              <StepTargets
                targets={state.targets}
                dropdownData={dropdownData}
                onChange={(targets) => setState((prev: WizardState) => ({ ...prev, targets }))}
              />
            </div>
          )}

          {state.currentStep === 3 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4">Step 3: Effects (Opzionale)</h2>
              <p className="text-slate-400 mb-6">
                Definisci le ricompense quando il nodo viene completato.
              </p>
              <StepEffects
                effects={state.effects}
                dropdownData={dropdownData}
                onChange={(effects) => setState((prev: WizardState) => ({ ...prev, effects }))}
              />
            </div>
          )}

          {state.currentStep === 4 && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4">Step 4: Content HTML</h2>
              <p className="text-slate-400 mb-6">
                Crea il contenuto narrativo del nodo con HTML e integra i targets definiti.
              </p>
              <StepHtmlEditor
                state={state}
                onChange={(updates) => setState((prev: WizardState) => ({ ...prev, ...updates }))}
                inventoryItems={dropdownData.inventoryItems}
                progressItems={dropdownData.progressItems} // AGGIUNTO
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={state.currentStep === 1}
              className="border-slate-600 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>

            <div className="text-sm text-slate-400">
              {!canProceed() && (
                <span className="text-amber-400">
                  {state.currentStep === 2 && 'Aggiungi almeno 1 target'}
                  {state.currentStep === 4 && 'Completa nome e HTML'}
                </span>
              )}
            </div>

            {state.currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Avanti
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSaving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salva Nodo
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Spacing per fixed footer */}
      <div className="h-20" />
    </div>
  );
}