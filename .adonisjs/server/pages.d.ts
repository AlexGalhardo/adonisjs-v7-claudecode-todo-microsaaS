import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/magic_link': ExtractProps<(typeof import('../../inertia/pages/auth/magic_link.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'auth/two_factor_challenge': ExtractProps<(typeof import('../../inertia/pages/auth/two_factor_challenge.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'settings/two_factor': ExtractProps<(typeof import('../../inertia/pages/settings/two_factor.tsx'))['default']>
  }
}
