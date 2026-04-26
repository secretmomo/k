import { basename } from 'node:path';

import consola from 'consola';
import {
  type InteractiveCard,
  type InteractiveCardElement,
  replyCardMessage,
  updateCardMessage,
  uploadImage,
} from '@k/notifier/lark';
import { genId, getMacHardwareInfo } from '@k/utils';

export class LarkCardState {
  private id = genId();
  private logger = consola.withTag(this.id);
  private title = '';
  private url = '';
  private tags: string[] = [];
  private htmlFilePath = '';
  private notionLink = '';
  private messageId = '';
  private start = 0;

  // 步骤一：初始化卡片状态
  async init(messageId: string) {
    this.start = Date.now();
    this.logger.info(`1. 初始化卡片状态 messageId: ${messageId}`);

    const res = await replyCardMessage(messageId, this.loadingCard('1. 正在解析网页标题...'));

    this.messageId = res.data!.message_id!;
  }

  // 步骤二：更新标题、地址、标签
  async updateTitle(title: string, url: string, tags: string[]) {
    this.logger.info(`2. title: ${title}, tags: ${tags.join(',')}`);

    this.title = title;
    this.url = url;
    this.tags = tags;

    await updateCardMessage(
      this.messageId,
      this.loadingCard(`${this.s1()}\n2. 正在下载网页内容...`),
    );
  }

  // 步骤三：下载网页内容
  async updateHtmlFilePath(htmlFilePath: string) {
    this.logger.info(`3. htmlFileName: ${basename(htmlFilePath)}`);

    this.htmlFilePath = htmlFilePath;

    await updateCardMessage(
      this.messageId,
      this.loadingCard(`${this.s1()}\n${this.s2()}\n3. 正在创建 Notion 页面...`),
    );
  }

  // 步骤四：创建 Notion 页面
  async updateNotionLink(notionLink: string) {
    this.logger.info(`4. notionLink: ${notionLink}`);

    this.notionLink = notionLink;

    await updateCardMessage(
      this.messageId,
      this.loadingCard(`${this.s1()}\n${this.s2()}\n${this.s3()}\n4. 正在生成预览图...`),
    );
  }

  async success(imagePath: string) {
    const imageKey = await uploadImage(imagePath);

    await updateCardMessage(this.messageId, this.successCard(imageKey));

    this.logger.success('5. 任务执行成功');
  }

  async error(content: string) {
    this.logger.error(`错误提示：${content}`);
    await updateCardMessage(this.messageId, this.errorCard(content));
  }

  private s1() {
    const tagsString = this.tags.map((tag) => `<text_tag color='blue'>${tag}</text_tag>`).join('');

    return `1. 标题：[${this.title}](${this.url}) ${tagsString} \n`;
  }

  private s2() {
    return `2. 文件路径：\`${basename(this.htmlFilePath)}\`\n`;
  }

  private s3() {
    return `3. [Notion 页面链接](${this.notionLink})\n`;
  }

  private footerElements(): InteractiveCardElement[] {
    const { chip, modelName } = getMacHardwareInfo();
    const nodeName = `${modelName}(${chip})`;

    return [
      {
        tag: 'hr',
        margin: '0px 0px 0px 0px',
      },
      {
        tag: 'div',
        text: {
          tag: 'plain_text',
          content: `${this.id} - ${nodeName}`,
          text_size: 'notation',
          text_color: 'grey',
        },
        icon: {
          tag: 'standard_icon',
          token: 'info_outlined',
          color: 'light_grey',
        },
      },
    ];
  }

  private loadingCard(content: string) {
    const card: InteractiveCard = {
      schema: '2.0',
      config: { update_multi: true },
      header: {
        template: 'grey',
        icon: { tag: 'standard_icon', token: 'ellipse_outlined' },
        title: { content: '处理中...', tag: 'plain_text' },
      },
      body: {
        direction: 'vertical',
        elements: [
          {
            tag: 'markdown',
            content: content,
            text_size: 'normal_v2',
            text_align: 'left',
            margin: '0px 0px 0px 0px',
          },
          ...this.footerElements(),
        ],
      },
    };

    return card;
  }

  private successCard(imageKey: string) {
    const card: InteractiveCard = {
      schema: '2.0',
      config: { update_multi: true },
      header: {
        template: 'green',
        icon: { tag: 'standard_icon', token: 'check_outlined' },
        title: { content: this.title, tag: 'plain_text' },
        subtitle: { content: `任务耗时 ${Date.now() - this.start} 毫秒`, tag: 'plain_text' },
        text_tag_list: this.tags.map((tag) => ({
          tag: 'text_tag',
          text: { content: tag, tag: 'plain_text' },
          color: 'green',
        })),
      },
      body: {
        direction: 'vertical',
        elements: [
          {
            tag: 'img',
            img_key: imageKey,
            scale_type: 'fit_horizontal',
          },
          {
            tag: 'button',
            text: {
              tag: 'plain_text',
              content: 'Notion',
            },
            type: 'primary_filled',
            width: 'default',
            size: 'small',
            behaviors: [
              {
                type: 'open_url',
                default_url: this.notionLink,
              },
            ],
            margin: '0px 0px 0px 0px',
          },
          ...this.footerElements(),
        ],
      },
    };

    return card;
  }

  private errorCard(content: string) {
    const card: InteractiveCard = {
      schema: '2.0',
      config: { update_multi: true },
      header: {
        template: 'red',
        icon: { tag: 'standard_icon', token: 'check_outlined' },
        title: { content: '错误提示', tag: 'plain_text' },
      },
      body: {
        direction: 'vertical',
        elements: [
          {
            tag: 'markdown',
            content: content,
          },
          ...this.footerElements(),
        ],
      },
    };

    return card;
  }
}
