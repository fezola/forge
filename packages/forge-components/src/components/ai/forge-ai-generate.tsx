import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';
import { ForgeInput } from '../ui/forge-input';
import { ForgeCard } from '../ui/forge-card';

export interface ForgeAiGenerateProps extends ForgeComponentConfig {
  model?: string;
  placeholder?: string;
  buttonText?: string;
  showInput?: boolean;
  streaming?: boolean;
  className?: string;
}

export function ForgeAiGenerate({
  model = 'openai',
  placeholder = 'Enter prompt...',
  buttonText = 'Generate',
  showInput = true,
  streaming = false,
  className,
  ...forgeConfig
}: ForgeAiGenerateProps) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');

    try {
      setResult(`Generated response for: "${prompt}"`);
      if (forgeConfig) forgeConfig.onEvent?.('success', { prompt, model });
    } catch (e: any) {
      if (forgeConfig) forgeConfig.onEvent?.('error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {showInput && (
        <ForgeInput
          {...forgeConfig}
          placeholder={placeholder}
          value={prompt}
          onChange={setPrompt}
        />
      )}
      <ForgeButton {...forgeConfig} loading={loading} onClick={handleGenerate} className="w-full">
        {buttonText}
      </ForgeButton>
      {result && (
        <ForgeCard {...forgeConfig}>
          <p className="text-sm whitespace-pre-wrap">{result}</p>
        </ForgeCard>
      )}
    </div>
  );
}
