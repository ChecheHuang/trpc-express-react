export const createServices = (years: number[]) => {
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
          {
            year,
            name: '祖先',
            price: 2000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '祖先',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
          {
            year,
            name: '冤親',
            price: 2000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '冤親',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
          {
            year,
            name: '嬰靈',
            price: 2000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '嬰靈',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
          {
            year,
            name: '其他',
            price: 2000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '其他',
                  start: 1,
                  end: 999,
                },
              ],
            },
          },
          {
            year,
            name: '普渡-餐',
            price: 2000,
            serviceItemDetails: {
              create: [
                {
                  rank: 1,
                  name: '01',
                  start: 1,
                  end: 10,
                },
                {
                  rank: 2,
                  name: '02',
                  start: 1,
                  end: 10,
                },
              ],
            },
          },
        ]),
      },
    },
    {
      category: '拜斗',
    },
    {
      category: '祈福',
    },
    {
      category: '其他',
    },
  ]
}
