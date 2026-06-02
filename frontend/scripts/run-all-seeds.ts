import 'dotenv/config'
import { seedEditor, seedSuperadmin } from './seed-superadmin'
import { seedPages } from './seed-pages'
import { seedSettings } from './seed-settings'
import { seedAttractions } from './seed-attractions'

async function main() {
  console.log('Running seeds…')
  await seedSuperadmin()
  await seedEditor()
  await seedPages()
  await seedSettings()
  await seedAttractions()
  console.log('All seeds completed.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
