import type { InteractiveCard, InteractiveCardElement } from '@k/notifier/lark';
import { dateTimeToNow, getNodeName } from '@k/utils';

export function startSuccessCard() {
  const nodeName = getNodeName();

  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    body: {
      direction: 'vertical',
      padding: '0px 0px 0px 0px',
      elements: [
        {
          tag: 'column_set',
          flex_mode: 'stretch',
          horizontal_spacing: '12px',
          horizontal_align: 'left',
          columns: [
            {
              tag: 'column',
              width: 'weighted',
              background_style: 'green-50',
              elements: [
                {
                  tag: 'markdown',
                  content: "## <font color='green'>启动成功</font>",
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `${nodeName}`,
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: dateTimeToNow(),
                  text_align: 'center',
                },
              ],
              padding: '12px 12px 12px 12px',
              vertical_spacing: '8px',
              horizontal_align: 'left',
              vertical_align: 'top',
              weight: 1,
            },
          ],
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  return card;
}

export function stopSuccessCard() {
  const nodeName = getNodeName();

  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    body: {
      direction: 'vertical',
      padding: '0px 0px 0px 0px',
      elements: [
        {
          tag: 'column_set',
          flex_mode: 'stretch',
          horizontal_spacing: '12px',
          horizontal_align: 'left',
          columns: [
            {
              tag: 'column',
              width: 'weighted',
              background_style: 'red-50',
              elements: [
                {
                  tag: 'markdown',
                  content: "## <font color='red'>关闭成功</font>",
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `${nodeName}`,
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: dateTimeToNow(),
                  text_align: 'center',
                },
              ],
              padding: '12px 12px 12px 12px',
              vertical_spacing: '8px',
              horizontal_align: 'left',
              vertical_align: 'top',
              weight: 1,
            },
          ],
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  return card;
}

function footerElements(id: string): InteractiveCardElement[] {
  const nodeName = getNodeName();

  return [
    {
      tag: 'hr',
      margin: '0px 0px 0px 0px',
    },
    {
      tag: 'div',
      text: {
        tag: 'plain_text',
        content: `${id} - ${nodeName}`,
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

export function loadingCard(id: string, content: string) {
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
        ...footerElements(id),
      ],
    },
  };

  return card;
}

interface SuccessCardProps {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  notionLink: string;
  imageKey: string;
}

export function successCard(props: SuccessCardProps) {
  const { id, title, subtitle, tags, notionLink, imageKey } = props;

  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header: {
      template: 'green',
      icon: { tag: 'standard_icon', token: 'check_outlined' },
      title: { content: title, tag: 'plain_text' },
      subtitle: { content: subtitle, tag: 'plain_text' },
      text_tag_list: tags.map((tag) => ({
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
              default_url: notionLink,
            },
          ],
          margin: '0px 0px 0px 0px',
        },
        ...footerElements(id),
      ],
    },
  };

  return card;
}

export function errorCard(id: string, content: string) {
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
        ...footerElements(id),
      ],
    },
  };

  return card;
}
