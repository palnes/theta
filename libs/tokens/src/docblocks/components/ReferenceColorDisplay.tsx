import React from 'react';
import { useColorTokens } from '../hooks/useColorTokens';
import { ColorDisplay } from './ColorDisplay';

export const SpecialColorsDisplay: React.FC = () => {
  const { data, loading, error } = useColorTokens({ type: 'reference' });

  if (loading) return <div>Loading special colors...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!data) return null;

  const specials = data.specialColors;

  // Convert to unified format
  const specialTokens = specials.map(({ name, token, cssVariable, jsPath }) => ({
    name,
    value: token.$value,
    cssVariable,
    jsPath,
  }));

  return <ColorDisplay title="Special Colors" tokens={specialTokens} />;
};

export const ReferenceColorScales: React.FC = () => {
  const { data, loading, error } = useColorTokens({ type: 'reference' });

  if (loading) return <div>Loading color scales...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!data) return null;

  const colorScales = data.colorScales;

  return (
    <>
      {colorScales.map(({ name, colors }) => {
        // Convert to unified format
        const scaleTokens = colors.map(({ shade, value, cssVariable, jsPath, jsFlat }) => ({
          name: `${name}${shade}`,
          value,
          cssVariable,
          jsPath,
          jsFlat,
        }));

        return <ColorDisplay key={name} title={`${name} Scale`} tokens={scaleTokens} />;
      })}
    </>
  );
};
