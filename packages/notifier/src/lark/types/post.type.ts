/**
 * 飞书富文本消息类型
 */
export interface Post {
  zh_cn: PostMessage;
  en_us?: PostMessage;
}

interface PostMessage {
  title?: string;
  content: PostParagraph[];
}

type PostParagraph =
  | (PostTextElement | PostLinkElement | PostAtElement | PostEmotionElement)[]
  | [PostMarkdownElement]
  | [PostCodeElement]
  | [PostImageElement]
  | [PostMediaElement]
  | [PostDividerElement];

type TextStyle = 'bold' | 'italic' | 'underline' | 'lineThrough';

/** 文本元素 */
interface PostTextElement {
  tag: 'text';
  text: string;
  style?: TextStyle[];
}

/** Markdown 元素 */
interface PostMarkdownElement {
  tag: 'md';
  text: string;
}

/** 代码块元素 */
interface PostCodeElement {
  tag: 'code_block';
  language: string;
  text: string;
}

/** 超链接元素 */
interface PostLinkElement {
  tag: 'a';
  href: string;
  text: string;
  style?: TextStyle[];
}

/** @人 元素 */
interface PostAtElement {
  tag: 'at';
  user_id: string;
  style?: TextStyle[];
}

/** 图片元素 */
interface PostImageElement {
  tag: 'img';
  image_key: string;
}

/** 媒体元素 */
interface PostMediaElement {
  tag: 'media';
  file_key: string;
  image_key?: string;
}

/** 表情元素 */
interface PostEmotionElement {
  tag: 'emotion';
  // https://open.feishu.cn/document/server-docs/im-v1/message-reaction/emojis-introduce
  emoji_type: string;
}

/** 分割线元素 */
interface PostDividerElement {
  tag: 'hr';
}
