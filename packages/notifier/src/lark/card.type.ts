// import type { InteractiveCard } from '@larksuiteoapi/node-sdk';
/**
 * 飞书卡片消息类型
 */
export interface InteractiveCard {
  schema: '2.0';
  config: InteractiveCardConfig;
  header: InteractiveCardHeader;
  body: InteractiveCardBody;
}

interface InteractiveCardConfig {
  enable_forward?: boolean;
  update_multi?: boolean;
  wide_screen_mode?: boolean;
}

export interface InteractiveCardHeader {
  template:
    | 'blue'
    | 'wathet'
    | 'turquoise'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'carmine'
    | 'violet'
    | 'purple'
    | 'indigo'
    | 'gray'
    | 'default';
  padding: string;
  icon: { tag: 'standard_icon'; token: string };
  title: { content: string; tag: 'plain_text' };
}

export interface InteractiveCardBody {
  direction: 'vertical' | 'horizontal';
  elements: InteractiveCardElement[];
}

export type InteractiveCardElement = InteractiveCardMarkdownElement | InteractiveCardButtonElement;

type TextSize = 'heading' | 'normal' | 'normal_v2' | 'notation';
type TextAlign = 'left' | 'center' | 'right';

interface InteractiveCardBaseElement {
  margin?: string;
}

export interface InteractiveCardMarkdownElement extends InteractiveCardBaseElement {
  tag: 'markdown';
  content: string;
  text_size?: TextSize;
  text_align?: TextAlign;
}

type ButtonType =
  | 'primary_filled'
  | 'danger_filled'
  | 'default'
  | 'primary'
  | 'danger'
  | 'primary_text'
  | 'danger_text';
type ButtonSize = 'tiny' | 'small' | 'medium' | 'large';
type ButtonWidth = 'default' | 'fill' | string;
interface ButtonBehavior {
  type: 'open_url';
  default_url: string;
}
export interface InteractiveCardButtonElement extends InteractiveCardBaseElement {
  tag: 'button';
  type: ButtonType;
  width: ButtonWidth;
  size: ButtonSize;
  behaviors?: ButtonBehavior[];
  text: {
    tag: 'plain_text';
    content: string;
  };
}
