import { axiosInstance } from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const searchValidation = z.object({
  code: z.string()
})

export const Route = createFileRoute('/oauth2')({
  component: RouteComponent,
  validateSearch: search => searchValidation.parse(search)
})

function RouteComponent() {

  const { code } = Route.useSearch()

  useQuery({
    queryKey: [code],
    queryFn: () => axiosInstance.post('/oauth2/discord', {
      code
    })
  })

  return <div>Hello {code}!</div>
}
