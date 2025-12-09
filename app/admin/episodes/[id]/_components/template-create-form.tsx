'use client';

import { TemplateSelector } from './template-selector';
import { type NodeTemplate } from '@/lib/templates/node-templates';
import { createNode } from '@/lib/actions/nodes-actions';

interface Props {
  episodeId: string;
}

export function TemplateCreateForm({ episodeId }: Props) {
  const handleTemplateSelect = async (template: NodeTemplate, customValues: Record<string, string>) => {
    // Sostituisci i placeholder nell'HTML
    let processedHtml = template.content_html;
    Object.entries(customValues).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedHtml = processedHtml.replaceAll(placeholder, value);
    });

    // Crea FormData per la submission
    const formData = new FormData();
    formData.append('episode_id', episodeId);
    formData.append('name', customValues['NODE_NAME'] || template.name);
    formData.append('node_category', template.category);
    formData.append('content_html', processedHtml);

    // Chiama la server action
    await createNode(formData);
  };

  return <TemplateSelector episodeId={episodeId} onTemplateSelect={handleTemplateSelect} />;
}