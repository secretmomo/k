import { type InteractiveCard } from '@k/notifier/lark';

export function buildLarkCard(totalLoginDays: number, checkInCoin: number, totalCoins: number) {
  const gold = Math.floor(totalCoins / 10000);
  const silver = Math.floor((totalCoins - 10000 * gold) / 100);
  const copper = totalCoins - 10000 * gold - 100 * silver;

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
              background_style: 'bg-white',
              elements: [
                {
                  tag: 'markdown',
                  content: `# <font color='green'>${checkInCoin}</font>`,
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `**<font color='sunflower-400'>${gold} 金</font> <font color='grey-400'>${silver} 银</font> <font color='orange-700'>${copper} 铜</font>**`,
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `<font color='grey-400'>累积签到 ${totalLoginDays} 天</font>`,
                  text_align: 'center',
                },
              ],
              padding: '12px 12px 12px 12px',
              vertical_spacing: '8px',
              horizontal_align: 'left',
              vertical_align: 'top',
              weight: 1,
              action: { multi_url: { url: process.env.RUN_URL! } },
            },
          ],
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  return card;
}
