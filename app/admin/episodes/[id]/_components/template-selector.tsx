'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { nodeTemplates, type NodeTemplate } from '@/lib/templates/node-templates';
import { Sparkles, ChevronRight, Info } from 'lucide-react';

interface Props {
  episodeId: string;
  onTemplateSelect: (template: NodeTemplate, customValues: Record<string, string>) => void;
}

export function TemplateSelector({ onTemplateSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NodeTemplate | null>(null);
  const [step, setStep] = useState<'select' | 'customize'>('select');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const handleTemplateClick = (template: NodeTemplate) => {
    setSelectedTemplate(template);
    
    // Estrai placeholder dal content_html
    const placeholders = extractPlaceholders(template.content_html);
    const initialValues: Record<string, string> = {};
    placeholders.forEach(p => {
      initialValues[p] = '';
    });
    setCustomValues(initialValues);
    
    setStep('customize');
  };

  const extractPlaceholders = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = html.match(regex);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const handleCreate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, customValues);
      setOpen(false);
      setStep('select');
      setSelectedTemplate(null);
      setCustomValues({});
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Sparkles className="w-4 h-4" />
          Create from Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Select a Template' : `Customize: ${selectedTemplate?.name}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2">
            {nodeTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="text-left p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    {template.category.replace('_', ' ')}
                  </span>
                  {template.suggestedTargets.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600">
                      {template.suggestedTargets.length} target{template.suggestedTargets.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'customize' && selectedTemplate && (
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">Basic Information</h3>
              <div>
                <Label htmlFor="node-name">Node Name*</Label>
                <Input
                  id="node-name"
                  value={customValues['NODE_NAME'] || ''}
                  onChange={(e) => setCustomValues({ ...customValues, NODE_NAME: e.target.value })}
                  placeholder="Enter node name..."
                />
              </div>
            </div>

            {/* Template Placeholders */}
            {Object.keys(customValues).length > 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Content Customization</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(customValues)
                    .filter(key => key !== 'NODE_NAME')
                    .map((placeholder) => (
                      <div key={placeholder}>
                        <Label htmlFor={placeholder}>
                          {placeholder.replace(/_/g, ' ').toLowerCase()}
                        </Label>
                        <Input
                          id={placeholder}
                          value={customValues[placeholder]}
                          onChange={(e) => setCustomValues({ 
                            ...customValues, 
                            [placeholder]: e.target.value 
                          })}
                          placeholder={`Enter ${placeholder.toLowerCase()}...`}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Suggested Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Suggested Configuration
              </h3>
              
              {selectedTemplate.suggestedConditions.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    Unlock Conditions
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    {selectedTemplate.suggestedConditions.map((cond, idx) => (
                      <li key={idx}>• {cond.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTemplate.suggestedTargets.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                    Targets
                  </h4>
                  <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                    {selectedTemplate.suggestedTargets.map((target, idx) => (
                      <li key={idx}>• {target.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTemplate.suggestedEffects.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                    Effects
                  </h4>
                  <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                    {selectedTemplate.suggestedEffects.map((effect, idx) => (
                      <li key={idx}>• {effect.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back to Templates
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!customValues['NODE_NAME']}
                className="flex-1"
              >
                Create Node
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}