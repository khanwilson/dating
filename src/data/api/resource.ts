

export const enum HostApi {
  HostDev = 'http://localhost:3000',
  HostStg = '',
  HostProduct = '',
}

export const baseUrl = {
  value: HostApi.HostDev
}


export const devMode = {
  value: false
};

export const urls = {
  context: '/store-api/context',
  login: '/auth/login',
  logout: '/auth/logout',
  getListUser: '/users',
}
