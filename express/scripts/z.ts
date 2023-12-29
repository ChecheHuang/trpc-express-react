type Params = {
  parentId?: number
  currentBeliversParentIndex: number
  believers: { id: number; name: string }[]
}

function test({ parentId, believers, currentBeliversParentIndex = 0 }: Params) {
  const believersCopy = [...believers]

  if (parentId) {
    const seedBelievers = believersCopy.map((believer) => ({ ...believer, parentId }))
    return
  }

  const currentBelieversParent = believersCopy.splice(currentBeliversParentIndex, 1)[0]
  const currentBelieversChildren = believersCopy

  console.log(currentBelieversParent)
  console.log(currentBelieversChildren)

  const seedBelievers = {
    ...currentBelieversParent,
    children: {
      create: currentBelieversChildren,
    },
  }
  return
}

const believers: { id: number; name: string }[] = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Mike' },
  { id: 4, name: 'Emily' },
]

test({ parentId: undefined, currentBeliversParentIndex: 4, believers })

//todo
// 1.先做可以搜尋會員的modal並且取得id
// 2.
