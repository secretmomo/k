import consola from 'consola';
import { genId } from '@k/utils';
import { replyCardMessage, updateCardMessage, uploadImage } from '@k/notifier/lark';

import { errorCard, loadingCard, successCard } from './lark.template';

export class LarkCardState {
  private id = genId();
  readonly logger = consola.withTag(this.id);
  private start = 0;
  private messageId = '';
  private texts: string[] = [];

  async init(messageId: string, text: string) {
    this.start = Date.now();
    this.texts.push(text);

    const { id, texts } = this;
    const res = await replyCardMessage(messageId, loadingCard(id, texts.join('\n')));

    this.messageId = res.data!.message_id!;
  }

  addText(text: string) {
    this.texts.push(text);
  }

  replaceLastText(text: string) {
    this.texts[this.texts.length - 1] = text;
  }

  async update(replaceText: string, loadingText: string) {
    this.texts[this.texts.length - 1] = replaceText;
    this.texts.push(loadingText);

    const { messageId, id, texts } = this;

    await updateCardMessage(messageId, loadingCard(id, texts.join('\n')));
  }

  async error(content: string) {
    this.logger.error(`错误提示：${content}`);
    await updateCardMessage(this.messageId, errorCard(this.id, content));
  }

  async success(props: SuccessProps) {
    const { id, messageId } = this;
    const { title, tags, notionLink, imagePath } = props;
    const imageKey = await uploadImage(imagePath);

    await updateCardMessage(
      messageId,
      successCard({
        id,
        title,
        subtitle: `任务耗时 ${Date.now() - this.start} 毫秒`,
        tags,
        notionLink,
        imageKey,
      }),
    );

    this.logger.success('5. 任务执行成功');
  }
}

interface SuccessProps {
  title: string;
  tags: string[];
  notionLink: string;
  imagePath: string;
}
