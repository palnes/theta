/**
 * Type definitions for button component tokens JSON structure
 */

interface TokenValue {
  $value: string | number | number[];
  $type?: string;
}

interface ButtonColorVariant {
  background?: {
    default?: TokenValue;
    hover?: TokenValue;
    active?: TokenValue;
    disabled?: TokenValue;
  };
  text?: {
    default?: TokenValue;
    disabled?: TokenValue;
  };
  border?: {
    default?: TokenValue;
  };
}

interface ButtonSizeValue {
  small?: TokenValue;
  medium?: TokenValue;
  large?: TokenValue;
}

export interface ButtonComponentTokens {
  cmp: {
    button: {
      height?: ButtonSizeValue;
      radius?: ButtonSizeValue;
      paddingX?: ButtonSizeValue;
      paddingY?: ButtonSizeValue;
      fontSize?: ButtonSizeValue;
      gap?: ButtonSizeValue;
      fontWeight?: TokenValue;
      lineHeight?: TokenValue;
      fontFamily?: TokenValue;
      borderWidth?: {
        ghost?: TokenValue;
      };
      borderStyle?: {
        ghost?: TokenValue;
      };
      opacity?: {
        disabled?: TokenValue;
      };
      scale?: {
        pressed?: TokenValue;
      };
      outline?: {
        width?: TokenValue;
        offset?: TokenValue;
      };
      transition?: {
        duration?: TokenValue;
        easing?: TokenValue & { $type?: 'cubicBezier' };
      };
      color?: {
        primary?: ButtonColorVariant;
        secondary?: ButtonColorVariant;
        ghost?: ButtonColorVariant;
        muted?: ButtonColorVariant;
        danger?: ButtonColorVariant;
        [key: string]: ButtonColorVariant | undefined;
      };
    };
  };
}
