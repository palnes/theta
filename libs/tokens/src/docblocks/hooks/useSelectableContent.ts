import { useCallback } from 'react';

export const useSelectableContent = () => {
  const handleSelectContent = useCallback((target: React.MouseEvent<HTMLElement> | HTMLElement) => {
    if ('stopPropagation' in target) {
      target.stopPropagation();
    }
    const element = 'currentTarget' in target ? target.currentTarget : target;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  return { handleSelectContent };
};
