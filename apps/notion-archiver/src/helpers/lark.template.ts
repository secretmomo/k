import type { InteractiveCard } from '@k/notifier/lark';
import { dateTimeToNow, getMacHardwareInfo } from '@k/utils';

export function startSuccessCard() {
  const { chip, modelName } = getMacHardwareInfo();
  const nodeName = `${modelName}(${chip})`;

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
  const { chip, modelName } = getMacHardwareInfo();
  const nodeName = `${modelName}(${chip})`;

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
