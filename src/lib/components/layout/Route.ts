export interface RouteCategory {
  name: string
  routes: Route[]
  headerClass?: string
}

export interface Route {
  name: string
  href: string
  target?: string
}
