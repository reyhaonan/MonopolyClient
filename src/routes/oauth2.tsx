import { axiosInstance } from '@/utils/axiosInstance'
import { getCookie } from '@/utils/cookie'
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

  // useQuery({
  //   queryKey: [code],
  //   queryFn: () => axiosInstance.post('/oauth2/discord', {
  //     code
  //   },)
  // })
  useQuery({
    queryKey: [code],
    queryFn: async () => {
      const res = await axiosInstance.post('/auth/discord', { code })

      sessionStorage.setItem("XSRF-TOKEN", getCookie("XSRF-TOKEN"))
      return res
    }
  })

  return <div>Hello {code}!</div>
}
