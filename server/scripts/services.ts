export const createServices = (years: number[]) => {
  const createItem = (
    year: number,
    name,
    price = 500,
    createArray = [
      {
        rank: 1,
        name: name + '01',
        start: 1,
        end: 10,
      },
    ]
  ) => ({
    year,
    name,
    price,
    serviceItemDetails: {
      create: createArray,
    },
  })

  return [
    {
      category: '點燈',
      serviceItems: {
        create: years.flatMap((year) => [
          {
            year,
            name: '平安',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '平01',
                  start: 1,
                  end: 6,
                },
                {
                  rank: 2,
                  name: '平02',
                  start: 1,
                  end: 7,
                },
              ],
            },
          },
          {
            year,
            name: '光明',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '光01',
                  start: 1,
                  end: 6,
                },
                {
                  rank: 2,
                  name: '光02',
                  start: 1,
                  end: 7,
                },
              ],
            },
          },
          {
            year,
            name: '元辰',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '元01',
                  start: 1,
                  end: 6,
                },
                {
                  rank: 2,
                  name: '元02',
                  start: 1,
                  end: 7,
                },
              ],
            },
          },
          {
            year,
            name: '文昌',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '文01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '財神',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '財01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '姻緣',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '姻01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '太歲',
            price: 500,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '太01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '佛外',
            price: 1000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '佛內',
            price: 3000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '01',
                  start: 1,
                  end: 6,
                },
              ],
            },
          },
          {
            year,
            name: '祭改',
            price: 0,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '改',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
          {
            year,
            name: '延壽',
            price: 300,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '壽',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
        ]),
      },
    },
    {
      category: '超渡',
      serviceItems: {
        create: years.flatMap((year) => [
          createItem(year, '祖先', 2000),
          createItem(year, '冤親', 2000),
          createItem(year, '嬰靈', 2000),
          createItem(year, '其他', 2000),
          createItem(year, '普渡-餐', 1200),
          createItem(year, '普渡', 700),
          createItem(year, '歷代', 2000),
          createItem(year, '只會餐', 600),
        ]),
      },
    },
    {
      category: '拜斗',
      serviceItems: {
        create: years.flatMap((year) => [
          createItem(year, '觀音佛祖斗首', 32000),
          createItem(year, '玉皇上帝斗首', 26000),
          createItem(year, '三官大帝斗首', 26000),
          createItem(year, '北極紫微大帝斗首', 20000),
          createItem(year, '圓明斗姥元君斗首', 12000),
          createItem(year, '東斗護身真君斗首', 12000),
          createItem(year, '西斗保生真君斗首', 12000),
          createItem(year, '南斗延壽真君斗首', 12000),
          createItem(year, '北斗解厄真君斗首', 12000),
          createItem(year, '中斗大魁真君斗首', 12000),
          createItem(year, '金母娘娘斗首', 6000),
          createItem(year, '王母娘娘斗首', 6000),
          createItem(year, '地母娘娘斗首', 6000),
          createItem(year, '三清道祖斗首', 6000),
          createItem(year, '文昌帝君斗首', 6000),
          createItem(year, '濟公仙佛斗首', 6000),
          createItem(year, '清水祖師斗首', 6000),
          createItem(year, '孚佑帝君斗首', 6000),
          createItem(year, '關聖帝君斗首', 6000),
          createItem(year, '月老鴻鸞星君斗首', 6000),
          createItem(year, '彌勒佛斗首', 6000),
          createItem(year, '九天武財神爺斗首', 6000),
          createItem(year, '法主聖君斗首', 6000),
          createItem(year, '天上聖母斗首', 6000),
          createItem(year, '中壇元帥斗首', 6000),
          createItem(year, '霞海城隍爺斗首', 6000),
          createItem(year, '豁落靈官王天君斗首', 6000),
          createItem(year, '太乙真人斗首', 6000),
          createItem(year, '護國祐民五府千歲斗首', 6000),
          createItem(year, '護國祐民薛府千歲斗首', 6000),
          createItem(year, '護道真君陳聖王斗首', 6000),
          createItem(year, '福德正神斗首', 6000),
          createItem(year, '勇猛將軍斗首', 6000),
          createItem(year, '東廚司命灶君斗首', 6000),
          createItem(year, '平安斗-會餐', 1500),
          createItem(year, '平安斗', 1500),
          createItem(year, '拱斗', 0),
          createItem(year, '只參加會餐', 600),
        ]),
      },
    },
    {
      category: '捐獻',
      serviceItems: {
        create: years.flatMap((year) => [
          createItem(year, '牌樓整修', 0),
          createItem(year, '打齋', 0),
          createItem(year, '油香簿', 0),
          createItem(year, '冬令救濟', 0),
          createItem(year, '敬花會', 1200),
          createItem(year, '敬果會', 1200),
          createItem(year, '佛祖會', 700),
          createItem(year, '年費(105年度開始)', 3000),
          createItem(year, '農民曆', 0),
          createItem(year, '油飯', 0),
          createItem(year, '神衣', 0),
          createItem(year, '其他捐款', 0),
          createItem(year, '平安戲(109年停辦)', 500),
          createItem(year, '中元普渡-網路報名', 700),
          createItem(year, '社會救濟', 0),
          createItem(year, '中元普渡-只會餐', 700),
          createItem(year, '爐主', 12000),
          createItem(year, '副爐主', 6000),
          createItem(year, '頭家', 3000),
          createItem(year, '金牌', 0),
          createItem(year, '黃色大燈籠', 5000),
          createItem(year, '超拔財寶箱', 300),
          createItem(year, '消防車'),
        ]),
      },
    },
    {
      category: '其他',
    },
  ]
}
