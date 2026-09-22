import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  columns: {
    // Encrypted 2FA secret/recovery codes — never serialize, same treatment
    // the generator already gives "password" by default.
    two_factor_secret: {
      tsType: 'string',
      imports: [],
      decorators: [{ name: '@column', args: { serializeAs: null } }],
    },
    two_factor_recovery_codes: {
      tsType: 'string',
      imports: [],
      decorators: [{ name: '@column', args: { serializeAs: null } }],
    },
  },
} satisfies SchemaRules
