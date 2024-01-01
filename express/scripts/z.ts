type BeliverType = {
  id: number
  name: string
  isParent?: boolean
}
type Params = {
  parentId?: number
  believers: BeliverType[]
}

function test({ parentId, believers }: Params) {
  const believersCopy = [...believers]

  if (parentId) {
    const seedBelievers = believersCopy.map((believer) => ({ ...believer, parentId }))
    return
  }

  const currentBeliversParentIndex = believersCopy.findIndex((believer) => believer.id === currentBeliversParentIndex)

  const currentBelieversParent = believersCopy.splice(currentBeliversParentIndex, 1)[0]
  const currentBelieversChildren = believersCopy

  const seedBelievers = {
    ...currentBelieversParent,
    children: {
      create: currentBelieversChildren,
    },
  }
  return
}

const believers: BeliverType[] = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Mike' },
  { id: 4, name: 'Emily' },
]

test({ parentId: undefined, believers })

//todo
// 1.先做可以搜尋會員的modal並且取得id
// 2.
