// Drop-in replacement de src/api/base44Client.js.
// Objectif : les 57 fichiers existants qui font
//   import { base44 } from '@/api/base44Client'
//   base44.entities.Client.filter(...)
//   base44.auth.me()
//   base44.integrations.Core.SendEmail(...)
// continuent de fonctionner SANS AUCUNE MODIFICATION.
// Seule l'implémentation change : Supabase au lieu du SDK Base44.

import { buildEntities } from './entityClient';
import { authClient } from './authClient';
import { integrationsClient } from './integrationsClient';
import { KNOWN_ENTITIES } from './entityTables';

export const base44 = {
  entities: buildEntities(KNOWN_ENTITIES),
  auth: authClient,
  integrations: integrationsClient,
};
