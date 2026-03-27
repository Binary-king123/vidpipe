import { prisma } from '@/lib/db'

export default async function QueuePage() {
  const queue = await prisma.videoQueue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Quick stats
  const total = await prisma.videoQueue.count()
  const pending = await prisma.videoQueue.count({ where: { status: 'pending' } })
  const failed = await prisma.videoQueue.count({ where: { status: 'failed' } })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Queue Status</h1>
      <p className="text-gray-400 mb-8">
        Total: {total} | Pending: {pending} | Failed: {failed} (Showing last 50)
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800/50 text-gray-300 text-xs uppercase border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">CDN URL</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Retries</th>
              <th className="px-6 py-4">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Queue is empty.
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-500">#{item.id}</td>
                  <td className="px-6 py-4 truncate max-w-[300px]" title={item.cdnUrl}>
                    {item.cdnUrl}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'done' ? 'bg-green-500/10 text-green-500' :
                      item.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                      item.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.retryCount}/3</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
