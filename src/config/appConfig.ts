export default {
  primary_color: '#07B2F5',
  green_color: '#48bb78',
  red_color: '#f56565',
  storage_engine: 'local', // local or blockstack
  book_time_format: 'YYYY-w', // Careful changing this!! Its how all records are referenced. Changing it breaks everything.
  book_time_unit: 'week', // SERIOUSLY!
  data_root: 'data',
  book_root: 'data/books',
  always_locate_key: 'always-locate',
  dark_mode_key: 'dark-mode',
  theme_key: 'theme',
  support_email: 'support@happydata.org',
  support_contact: 'Email Support',
  messages_url: 'https://s3.amazonaws.com/cdn.nomie.app/messages/messages.json',
  s3providersLink: "https://spectacular-collard-13a.notion.site/S3-Storage-Providers-fa4888f87e964ffaabbe113c1ede8f83",
  apiDocumentation: "https://spectacular-collard-13a.notion.site/Nomie-API-4c29294776524e84bdafed6251abb20c",

  positivity: [
    { emoji: '🔴', label: 'Awful', score: -2 },
    { emoji: '🟠', label: 'Not Good', score: -1 },
    { emoji: 'Ⓞ', label: 'Neutral', score: 0 },
    { emoji: '🟢', label: 'Good', score: 1 },
    { emoji: '💚', label: 'Great', score: 2 },
  ] as Array<PositivityType>,
}

export type PositivityType = {
  emoji: string
  label: string
  score: number
}
