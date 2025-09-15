'use client'

interface OverviewCardsProps {
  totalUrls: number
  zombieUrls: number
  actionsPending: number
  indexBloat: number
}

export function OverviewCards({ totalUrls, zombieUrls, actionsPending, indexBloat }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total URLs',
      value: totalUrls.toLocaleString(),
      color: 'bg-blue-50 text-blue-600',
      icon: '📄'
    },
    {
      title: 'Zombie URLs',
      value: zombieUrls.toLocaleString(),
      color: 'bg-red-50 text-red-600',
      icon: '🧟'
    },
    {
      title: 'Actions Pending',
      value: actionsPending.toLocaleString(),
      color: 'bg-yellow-50 text-yellow-600',
      icon: '⚡'
    },
    {
      title: 'Index Bloat',
      value: `${indexBloat}%`,
      color: 'bg-purple-50 text-purple-600',
      icon: '📊'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color.split(' ')[1]}`}>
                {card.value}
              </p>
            </div>
            <div className={`text-3xl ${card.color.split(' ')[0]}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
