import type React from 'react';
import { useColorTokens } from '../../hooks/useColorTokens';
import { Colors } from './Colors';

export const SpecialColorsDisplay: React.FC = () => {
  // Special colors component can be removed or repurposed
  // For now, return null to avoid duplication
  return null;
};

export const ReferenceColorScales: React.FC = () => {
  const { tokens, loading, error } = useColorTokens({ tier: 'ref' });

  if (loading) return <div>Loading color scales...</div>;
  if (error) return <div>Error loading colors: {error}</div>;
  if (!tokens || tokens.length === 0) return null;

  // Group tokens by extracting color name from path
  const colorGroups = tokens.reduce((acc: Record<string, any[]>, token) => {
    // Extract color name from path like "ref.color.blue.100" -> "blue"
    const pathParts = token.path.split('.');
    const colorIndex = pathParts.indexOf('color');
    const colorName = pathParts[colorIndex + 1] || 'other';

    if (!acc[colorName]) {
      acc[colorName] = [];
    }
    acc[colorName].push(token);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(colorGroups).map(([groupName, groupTokens]) => {
        // Convert to unified format
        const scaleTokens = groupTokens.map((token: any) => ({
          name: token.name,
          value: token.value,
          usage: token.usage || [],
        }));

        return <Colors key={groupName} title={`${groupName} Scale`} tokens={scaleTokens} />;
      })}
    </>
  );
};
