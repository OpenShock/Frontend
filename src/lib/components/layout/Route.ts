export type RouteCategory =
    {
        name: string
        routes: Route[],
        headerClass?: string
    }

export type Route =
    {
        name: string
        path: string
        external?: boolean
    }